import { and, desc, eq, gt, isNull, sql } from "drizzle-orm";
import { db, passwordResets, profiles, refreshTokens, users, type User } from "../db/index.ts";
import { env } from "../env.ts";
import { badRequest, conflict, unauthorized } from "../lib/errors.ts";
import { signAccessToken, signPasswordResetToken, verifyPasswordResetToken } from "../lib/jwt.ts";
import { sendMail } from "../lib/mailer.ts";
import { hashPassword, verifyPassword } from "../lib/password.ts";
import { randomOtp, randomToken, sha256 } from "../lib/tokens.ts";

export type Session = {
  access_token: string;
  refresh_token: string;
  /** Unix seconds */
  expires_at: number;
  token_type: "bearer";
};

const publicUser = (u: User) => ({ id: u.id, email: u.email, created_at: u.created_at });

const normalizeEmail = (email: string) => email.trim().toLowerCase();

async function findUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(sql`lower(${users.email}) = ${normalizeEmail(email)}`);
  return user ?? null;
}

async function issueSession(user: User) {
  const { token: access_token, expiresAt } = await signAccessToken(user);
  const refresh_token = randomToken();
  await db.insert(refreshTokens).values({
    user_id: user.id,
    token_hash: sha256(refresh_token),
    expires_at: new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 86_400_000),
  });
  const session: Session = { access_token, refresh_token, expires_at: expiresAt, token_type: "bearer" };
  return { user: publicUser(user), session };
}

async function revokeAllSessions(tx: typeof db, userId: string) {
  await tx
    .update(refreshTokens)
    .set({ revoked_at: new Date() })
    .where(and(eq(refreshTokens.user_id, userId), isNull(refreshTokens.revoked_at)));
}

export async function signUp(email: string, password: string) {
  if (await findUserByEmail(email)) {
    throw conflict("An account with this email already exists", "user_already_exists");
  }
  const user = await db.transaction(async (tx) => {
    const [u] = await tx
      .insert(users)
      .values({
        email: normalizeEmail(email),
        password_hash: await hashPassword(password),
        email_confirmed_at: new Date(),
      })
      .returning();
    await tx.insert(profiles).values({ id: u!.id, email: u!.email });
    return u!;
  });
  return issueSession(user);
}

// Verified against when the email is unknown, so the response time doesn't
// reveal whether an account exists.
const DUMMY_HASH = await hashPassword(randomToken());

export async function signIn(email: string, password: string) {
  const user = await findUserByEmail(email);
  const ok = await verifyPassword(password, user?.password_hash ?? DUMMY_HASH);
  if (!user || !ok) throw unauthorized("Invalid email or password", "invalid_credentials");

  await db.update(users).set({ last_sign_in_at: new Date() }).where(eq(users.id, user.id));
  return issueSession(user);
}

/** Rotate: the presented refresh token is revoked and a new pair is issued. */
export async function refreshSession(refreshToken: string) {
  const invalid = (msg: string) => unauthorized(msg, "invalid_refresh_token");

  const [row] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token_hash, sha256(refreshToken)));
  if (!row) throw invalid("Invalid refresh token");
  if (row.revoked_at) {
    // A rotated token being replayed means it leaked: kill every session.
    await revokeAllSessions(db, row.user_id);
    throw invalid("Refresh token reused");
  }
  if (row.expires_at < new Date()) throw invalid("Refresh token expired");

  const [user] = await db.select().from(users).where(eq(users.id, row.user_id));
  if (!user) throw invalid("User no longer exists");

  await db.update(refreshTokens).set({ revoked_at: new Date() }).where(eq(refreshTokens.id, row.id));
  return issueSession(user);
}

export async function signOut(userId: string, refreshToken?: string, everywhere = false) {
  if (everywhere) return revokeAllSessions(db, userId);
  if (!refreshToken) return;
  await db
    .update(refreshTokens)
    .set({ revoked_at: new Date() })
    .where(and(eq(refreshTokens.user_id, userId), eq(refreshTokens.token_hash, sha256(refreshToken))));
}

export async function getUser(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) throw unauthorized("User no longer exists");
  return publicUser(user);
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user || !(await verifyPassword(currentPassword, user.password_hash))) {
    throw unauthorized("Current password is incorrect", "invalid_credentials");
  }
  await db
    .update(users)
    .set({ password_hash: await hashPassword(newPassword) })
    .where(eq(users.id, userId));
}

// ---------------------------------------------------------------------------
// Password reset: email -> 6-digit code -> short-lived reset token -> new password
// ---------------------------------------------------------------------------
const OTP_TTL_MS = 10 * 60_000;
const OTP_MAX_ATTEMPTS = 5;

export async function requestPasswordReset(email: string) {
  const user = await findUserByEmail(email);
  if (!user) return; // Same response either way, so emails can't be enumerated.

  const code = randomOtp();
  await db.transaction(async (tx) => {
    await tx
      .update(passwordResets)
      .set({ consumed_at: new Date() })
      .where(and(eq(passwordResets.user_id, user.id), isNull(passwordResets.consumed_at)));
    await tx.insert(passwordResets).values({
      user_id: user.id,
      code_hash: sha256(code),
      expires_at: new Date(Date.now() + OTP_TTL_MS),
    });
  });

  await sendMail({
    to: user.email,
    subject: "Your TaskNest password reset code",
    text: `Your verification code is ${code}. It expires in 10 minutes.\n\nIf you didn't request this, you can ignore this email.`,
  });
}

export async function verifyPasswordResetCode(email: string, code: string) {
  const invalid = () => badRequest("invalid_otp", "Invalid or expired code");

  const user = await findUserByEmail(email);
  if (!user) throw invalid();

  const [reset] = await db
    .select()
    .from(passwordResets)
    .where(
      and(
        eq(passwordResets.user_id, user.id),
        isNull(passwordResets.consumed_at),
        gt(passwordResets.expires_at, new Date())
      )
    )
    .orderBy(desc(passwordResets.created_at))
    .limit(1);
  if (!reset || reset.attempts >= OTP_MAX_ATTEMPTS) throw invalid();

  if (reset.code_hash !== sha256(code.trim())) {
    await db
      .update(passwordResets)
      .set({ attempts: reset.attempts + 1 })
      .where(eq(passwordResets.id, reset.id));
    throw invalid();
  }

  await db.update(passwordResets).set({ verified_at: new Date() }).where(eq(passwordResets.id, reset.id));
  const { token } = await signPasswordResetToken(user.id, reset.id);
  return { reset_token: token };
}

export async function resetPassword(resetToken: string, newPassword: string) {
  const invalid = () => badRequest("invalid_reset_token", "Invalid or expired reset token");

  const claims = await verifyPasswordResetToken(resetToken);
  if (!claims) throw invalid();

  const [reset] = await db
    .select()
    .from(passwordResets)
    .where(and(eq(passwordResets.id, claims.rid), eq(passwordResets.user_id, claims.sub)));
  if (!reset?.verified_at || reset.consumed_at) throw invalid();

  const password_hash = await hashPassword(newPassword);
  await db.transaction(async (tx) => {
    await tx.update(users).set({ password_hash }).where(eq(users.id, claims.sub));
    await tx.update(passwordResets).set({ consumed_at: new Date() }).where(eq(passwordResets.id, reset.id));
    await revokeAllSessions(tx as unknown as typeof db, claims.sub);
  });
}

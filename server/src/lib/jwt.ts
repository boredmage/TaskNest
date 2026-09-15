import { sign, verify } from "hono/jwt";
import type { JWTPayload } from "hono/utils/jwt/types";
import { env } from "../env.ts";

export type AccessTokenClaims = {
  sub: string;
  email: string;
  iat: number;
  exp: number;
};

async function signToken(payload: Record<string, unknown>, ttlSeconds: number) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + ttlSeconds;
  const token = await sign({ ...payload, iat, exp }, env.JWT_SECRET, "HS256");
  return { token, expiresAt: exp };
}

async function verifyToken<T extends JWTPayload>(token: string): Promise<T | null> {
  try {
    return (await verify(token, env.JWT_SECRET, "HS256")) as T;
  } catch {
    return null;
  }
}

export function signAccessToken(user: { id: string; email: string }) {
  return signToken({ sub: user.id, email: user.email, purpose: "access" }, env.ACCESS_TOKEN_TTL_SECONDS);
}

export async function verifyAccessToken(token: string) {
  const claims = await verifyToken<AccessTokenClaims & { purpose?: string }>(token);
  if (!claims || typeof claims.sub !== "string" || claims.purpose !== "access") {
    return null;
  }
  return claims;
}

/** Short-lived token proving a password-reset OTP was verified. */
export function signPasswordResetToken(userId: string, resetId: string) {
  return signToken({ sub: userId, rid: resetId, purpose: "password_reset" }, 15 * 60);
}

export async function verifyPasswordResetToken(token: string) {
  const claims = await verifyToken<{ sub: string; rid: string; purpose: string }>(token);
  if (!claims || claims.purpose !== "password_reset") return null;
  return claims;
}

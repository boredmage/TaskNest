import { eq, inArray } from "drizzle-orm";
import { extname, join } from "node:path";
import { db, profiles, type DbOrTx } from "../db/index.ts";
import { env } from "../env.ts";
import { badRequest, notFound } from "../lib/errors.ts";

export async function getProfile(userId: string) {
  const [row] = await db.select().from(profiles).where(eq(profiles.id, userId));
  if (!row) throw notFound("Profile not found");
  return row;
}

/** Name and avatar only: what other users are allowed to see. */
export function getPublicProfiles(ids: string[]) {
  if (ids.length === 0) return [];
  return db
    .select({ id: profiles.id, full_name: profiles.full_name, avatar_url: profiles.avatar_url })
    .from(profiles)
    .where(inArray(profiles.id, ids));
}

export async function getPublicProfile(id: string) {
  const [row] = await getPublicProfiles([id]);
  if (!row) throw notFound("Profile not found");
  return row;
}

/** How a user is referred to in notification text. */
export async function displayName(tx: DbOrTx, userId: string) {
  const [p] = await tx
    .select({ full_name: profiles.full_name, email: profiles.email })
    .from(profiles)
    .where(eq(profiles.id, userId));
  return p?.full_name?.trim() || p?.email.split("@")[0] || "Someone";
}

export type ProfilePatch = {
  full_name?: string | null;
  avatar_url?: string | null;
  /** Any ISO date/datetime; stored as a calendar date. */
  date_of_birth?: string | null;
};

export async function updateProfile(userId: string, patch: ProfilePatch) {
  const set: Partial<typeof profiles.$inferInsert> = {};
  if ("full_name" in patch) set.full_name = patch.full_name?.trim() || null;
  if ("avatar_url" in patch) set.avatar_url = patch.avatar_url || null;
  if ("date_of_birth" in patch) set.date_of_birth = toCalendarDate(patch.date_of_birth);

  const [row] = await db.update(profiles).set(set).where(eq(profiles.id, userId)).returning();
  if (!row) throw notFound("Profile not found");
  return row;
}

function toCalendarDate(value: string | null | undefined) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw badRequest("invalid_date", "date_of_birth is not a valid date");
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Avatars live on disk at UPLOADS_DIR/avatars/<userId>.<ext> and are served
// from /uploads. profiles.avatar_url stores the relative path, the same
// convention the client used with Supabase storage.
// ---------------------------------------------------------------------------
const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/heic": ".heic",
  "image/gif": ".gif",
};
const MAX_AVATAR_BYTES = 8 * 1024 * 1024;

export async function saveAvatar(userId: string, file: File) {
  if (file.size === 0) throw badRequest("empty_file", "Uploaded file is empty");
  if (file.size > MAX_AVATAR_BYTES) throw badRequest("file_too_large", "Avatar must be 8MB or smaller");

  const ext = EXT_BY_MIME[file.type] ?? extname(file.name ?? "").toLowerCase();
  if (!Object.values(EXT_BY_MIME).includes(ext)) {
    throw badRequest("unsupported_type", `Unsupported image type: ${file.type || "unknown"}`);
  }

  const path = `avatars/${userId}${ext}`;
  await Bun.write(join(env.UPLOADS_DIR, path), file);
  await removeStaleAvatars(userId, ext);
  await db.update(profiles).set({ avatar_url: path }).where(eq(profiles.id, userId));

  return { path, url: `${env.PUBLIC_URL}/uploads/${path}` };
}

async function removeStaleAvatars(userId: string, keepExt: string) {
  for (const ext of new Set(Object.values(EXT_BY_MIME))) {
    if (ext === keepExt) continue;
    const stale = Bun.file(join(env.UPLOADS_DIR, `avatars/${userId}${ext}`));
    if (await stale.exists()) await stale.delete();
  }
}

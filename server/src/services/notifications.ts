import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import {
  db,
  notificationPreferences,
  notifications,
  userPushTokens,
  type DbOrTx,
  type Notification,
  type NotificationType,
} from "../db/index.ts";
import { forbidden, notFound } from "../lib/errors.ts";
import { sendPush, type PushMessage } from "../lib/push.ts";
import { publish } from "../lib/realtime.ts";

export type NewNotification = typeof notifications.$inferInsert;

/**
 * Which settings toggle silences the push for each type. The in-app row is
 * always written; types not listed here always push (they need an action).
 */
const PUSH_TOGGLE: Partial<Record<NotificationType, string>> = {
  todo_assigned: "newTaskAssigned",
  todo_completed: "taskCompleted",
  todo_overdue: "taskOverdue",
  join_request_approved: "familyMemberJoined",
  family_invite_accepted: "familyMemberJoined",
};

/** Insert notification rows, then push them to the recipients' devices. */
export async function notify(tx: DbOrTx, items: NewNotification[]) {
  if (items.length === 0) return;
  const rows = await tx.insert(notifications).values(items).returning();
  for (const row of rows) publish([row.user_id], { type: "notification", notification: row });
  // Best effort, outside the caller's transaction.
  queueMicrotask(() => push(rows).catch((e) => console.warn("[push]", e)));
}

async function push(rows: Notification[]) {
  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const [tokens, prefs] = await Promise.all([
    db.select().from(userPushTokens).where(inArray(userPushTokens.user_id, userIds)),
    db.select().from(notificationPreferences).where(inArray(notificationPreferences.user_id, userIds)),
  ]);
  const prefsOf = new Map(prefs.map((p) => [p.user_id, p.preferences]));

  const messages: PushMessage[] = [];
  for (const row of rows) {
    const toggle = PUSH_TOGGLE[row.type];
    if (toggle && prefsOf.get(row.user_id)?.[toggle] === false) continue;
    for (const { token } of tokens.filter((t) => t.user_id === row.user_id)) {
      messages.push({
        to: token,
        title: row.title ?? undefined,
        body: row.body ?? undefined,
        sound: "default",
        data: { notification_id: row.id, type: row.type, ...row.data },
      });
    }
  }
  await sendPush(messages);
}

export function listForUser(userId: string, limit: number) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.user_id, userId))
    .orderBy(desc(notifications.created_at))
    .limit(limit);
}

/** Merge `data` and/or set `read_at` on one of the user's own notifications. */
export async function patchForUser(
  userId: string,
  id: string,
  patch: { data?: Record<string, unknown>; read_at?: string | null }
) {
  const [existing] = await db.select().from(notifications).where(eq(notifications.id, id));
  if (!existing) throw notFound("Notification not found");
  if (existing.user_id !== userId) throw forbidden("Not your notification");

  const [updated] = await db
    .update(notifications)
    .set({
      data: patch.data ? { ...existing.data, ...patch.data } : existing.data,
      read_at:
        patch.read_at === undefined ? existing.read_at : patch.read_at ? new Date(patch.read_at) : null,
    })
    .where(eq(notifications.id, id))
    .returning();
  return updated!;
}

export async function markAllRead(userId: string) {
  await db
    .update(notifications)
    .set({ read_at: new Date() })
    .where(and(eq(notifications.user_id, userId), isNull(notifications.read_at)));
}

/**
 * Mark every notification of `type` about a given record as handled: merges
 * `patch` into `data` and sets `read_at`. E.g. once an owner approves a join
 * request, every admin's "join_request_received" card hides its buttons.
 */
/** Remove notifications that point at a record which no longer exists (e.g. a replaced invite). */
export async function removeByRef(tx: DbOrTx, type: NotificationType, ref: { key: string; ids: string[] }) {
  if (ref.ids.length === 0) return;
  await tx
    .delete(notifications)
    .where(and(eq(notifications.type, type), inArray(sql`${notifications.data} ->> ${ref.key}`, ref.ids)));
}

export async function markHandled(
  tx: DbOrTx,
  type: NotificationType,
  ref: { key: string; id: string },
  patch: Record<string, unknown>
) {
  await tx
    .update(notifications)
    .set({
      data: sql`coalesce(${notifications.data}, '{}'::jsonb) || ${JSON.stringify(patch)}::jsonb`,
      read_at: sql`coalesce(${notifications.read_at}, now())`,
    })
    .where(and(eq(notifications.type, type), sql`${notifications.data} ->> ${ref.key} = ${ref.id}`));
}

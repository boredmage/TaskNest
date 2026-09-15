import { index, jsonb, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { notificationType } from "./enums.ts";
import { createdAt, id, timestampTz, updatedAt } from "./helpers.ts";
import { userRef, users } from "./users.ts";

export const notifications = pgTable(
  "notifications",
  {
    id: id(),
    user_id: userRef("user_id"),
    type: notificationType("type").notNull(),
    title: text("title"),
    body: text("body"),
    data: jsonb("data").$type<Record<string, unknown>>().default({}),
    initiator_id: uuid("initiator_id").references(() => users.id, { onDelete: "set null" }),
    read_at: timestampTz("read_at"),
    created_at: createdAt(),
  },
  (t) => [index("notifications_user_created_idx").on(t.user_id, t.created_at)]
);

/** The toggles on the Notifications settings screen, keyed by toggle name. */
export const notificationPreferences = pgTable("notification_preferences", {
  user_id: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  preferences: jsonb("preferences").$type<Record<string, boolean>>().notNull().default({}),
  updated_at: updatedAt(),
});

export const userPushTokens = pgTable(
  "user_push_tokens",
  {
    id: id(),
    user_id: userRef("user_id"),
    token: text("token").notNull(),
    platform: text("platform").notNull().default("expo"),
    created_at: createdAt(),
  },
  (t) => [uniqueIndex("user_push_tokens_user_token_idx").on(t.user_id, t.token)]
);

export type Notification = typeof notifications.$inferSelect;

import { sql } from "drizzle-orm";
import { date, index, integer, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { createdAt, id, timestampTz, updatedAt } from "./helpers.ts";

export const users = pgTable(
  "users",
  {
    id: id(),
    email: text("email").notNull(),
    password_hash: text("password_hash").notNull(),
    email_confirmed_at: timestampTz("email_confirmed_at"),
    last_sign_in_at: timestampTz("last_sign_in_at"),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (t) => [uniqueIndex("users_email_lower_idx").on(sql`lower(${t.email})`)]
);

/** FK to users.id that cascades on delete. Shared by every other table. */
export const userRef = (name: string) =>
  uuid(name)
    .notNull()
    .references(() => users.id, { onDelete: "cascade" });

export const profiles = pgTable("profiles", {
  id: uuid("id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  full_name: text("full_name"),
  avatar_url: text("avatar_url"),
  date_of_birth: date("date_of_birth"),
  created_at: createdAt(),
  updated_at: updatedAt(),
});

export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: id(),
    user_id: userRef("user_id"),
    token_hash: text("token_hash").notNull(),
    expires_at: timestampTz("expires_at").notNull(),
    revoked_at: timestampTz("revoked_at"),
    created_at: createdAt(),
  },
  (t) => [
    uniqueIndex("refresh_tokens_hash_idx").on(t.token_hash),
    index("refresh_tokens_user_idx").on(t.user_id),
  ]
);

export const passwordResets = pgTable(
  "password_resets",
  {
    id: id(),
    user_id: userRef("user_id"),
    code_hash: text("code_hash").notNull(),
    attempts: integer("attempts").notNull().default(0),
    expires_at: timestampTz("expires_at").notNull(),
    verified_at: timestampTz("verified_at"),
    consumed_at: timestampTz("consumed_at"),
    created_at: createdAt(),
  },
  (t) => [index("password_resets_user_idx").on(t.user_id)]
);

export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;

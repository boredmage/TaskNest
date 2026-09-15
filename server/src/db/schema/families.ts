import { boolean, index, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { familyMemberRole, inviteStatus, joinRequestStatus } from "./enums.ts";
import { createdAt, id, timestampTz, updatedAt } from "./helpers.ts";
import { userRef, users } from "./users.ts";

export const families = pgTable(
  "families",
  {
    id: id(),
    invite_code: text("invite_code").notNull(),
    owner_id: userRef("owner_id"),
    is_archived: boolean("is_archived").notNull().default(false),
    archived_at: timestampTz("archived_at"),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (t) => [
    uniqueIndex("families_invite_code_idx").on(t.invite_code),
    index("families_owner_idx").on(t.owner_id),
  ]
);

const familyRef = (name: string) =>
  uuid(name)
    .notNull()
    .references(() => families.id, { onDelete: "cascade" });

export const familyMembers = pgTable(
  "family_members",
  {
    id: id(),
    family_id: familyRef("family_id"),
    user_id: userRef("user_id"),
    role: familyMemberRole("role").notNull().default("member"),
    joined_at: timestampTz("joined_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("family_members_family_user_idx").on(t.family_id, t.user_id),
    index("family_members_user_idx").on(t.user_id),
  ]
);

/** An owner inviting an existing user by email. `user_id` is the invitee. */
export const familyInvites = pgTable(
  "family_invites",
  {
    id: id(),
    family_id: familyRef("family_id"),
    user_id: userRef("user_id"),
    invited_by: userRef("invited_by"),
    /** Role the invitee gets on acceptance: admin = "can edit", member = "can view". */
    role: familyMemberRole("role").notNull().default("member"),
    status: inviteStatus("status").notNull().default("pending"),
    responded_at: timestampTz("responded_at"),
    created_at: createdAt(),
  },
  (t) => [index("family_invites_user_idx").on(t.user_id), index("family_invites_family_idx").on(t.family_id)]
);

/** A user asking to join with the family's invite code. */
export const familyJoinRequests = pgTable(
  "family_join_requests",
  {
    id: id(),
    family_id: familyRef("family_id"),
    user_id: userRef("user_id"),
    status: joinRequestStatus("status").notNull().default("pending"),
    reviewed_at: timestampTz("reviewed_at"),
    reviewed_by: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
    created_at: createdAt(),
  },
  (t) => [
    index("family_join_requests_family_idx").on(t.family_id),
    index("family_join_requests_user_idx").on(t.user_id),
  ]
);

export type Family = typeof families.$inferSelect;

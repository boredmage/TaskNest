import { pgEnum } from "drizzle-orm/pg-core";

export const familyMemberRole = pgEnum("family_member_role", ["owner", "admin", "member"]);
export const inviteStatus = pgEnum("invite_status", ["pending", "accepted", "declined"]);
export const joinRequestStatus = pgEnum("join_request_status", ["pending", "approved", "declined"]);
export const todoScope = pgEnum("todo_scope", ["personal", "family"]);
export const todoStatus = pgEnum("todo_status", ["in_progress", "completed", "overdue", "archived"]);
export const todoPriority = pgEnum("todo_priority", ["low", "medium", "high"]);
export const todoRepeat = pgEnum("todo_repeat", ["none", "daily", "weekly", "monthly"]);
export const notificationType = pgEnum("notification_type", [
  "family_invite_received",
  "family_invite_accepted",
  "join_request_received",
  "join_request_approved",
  "todo_assigned",
  "todo_completed",
  "todo_overdue",
  "todo_reminder",
  "family_archived",
]);

export type TodoScope = (typeof todoScope.enumValues)[number];
export type TodoStatus = (typeof todoStatus.enumValues)[number];
export type NotificationType = (typeof notificationType.enumValues)[number];
export type TodoPriority = (typeof todoPriority.enumValues)[number];
export type TodoRepeat = (typeof todoRepeat.enumValues)[number];

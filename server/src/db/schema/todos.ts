import { index, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { todoPriority, todoRepeat, todoScope, todoStatus } from "./enums.ts";
import { families } from "./families.ts";
import { createdAt, id, timestampTz, updatedAt } from "./helpers.ts";
import { userRef } from "./users.ts";

export const todos = pgTable(
  "todos",
  {
    id: id(),
    scope: todoScope("scope").notNull().default("personal"),
    family_id: uuid("family_id").references(() => families.id, { onDelete: "cascade" }),
    owner_id: userRef("owner_id"),
    title: text("title").notNull(),
    description: text("description"),
    category: text("category"),
    assignee_ids: uuid("assignee_ids").array(),
    due_date: timestampTz("due_date"),
    status: todoStatus("status").notNull().default("in_progress"),
    priority: todoPriority("priority").notNull().default("medium"),
    repeat: todoRepeat("repeat").notNull().default("none"),
    /** Minutes before due_date to remind; null = no reminder. */
    reminder_minutes: integer("reminder_minutes"),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (t) => [
    index("todos_owner_idx").on(t.owner_id),
    index("todos_family_idx").on(t.family_id),
    index("todos_status_due_idx").on(t.status, t.due_date),
  ]
);

export type Todo = typeof todos.$inferSelect;

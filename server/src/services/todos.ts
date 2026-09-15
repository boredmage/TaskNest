import { and, desc, eq, exists, lt, or, sql } from "drizzle-orm";
import {
  db,
  familyMembers,
  todos,
  type DbOrTx,
  type Todo,
  type TodoPriority,
  type TodoRepeat,
  type TodoScope,
  type TodoStatus,
} from "../db/index.ts";
import { badRequest, forbidden, notFound } from "../lib/errors.ts";
import { publish } from "../lib/realtime.ts";
import { isMember, memberIds } from "./families.ts";
import { notify, type NewNotification } from "./notifications.ts";
import { displayName } from "./profiles.ts";

export type TodoInput = {
  title?: string;
  description?: string | null;
  category?: string | null;
  due_date?: string | null;
  assignee_ids?: string[] | null;
  status?: TodoStatus;
  priority?: TodoPriority;
  repeat?: TodoRepeat;
  reminder_minutes?: number | null;
};

export type CreateTodoInput = TodoInput & {
  title: string;
  scope?: TodoScope;
  family_id?: string | null;
};

/** Personal todos the user owns plus every todo of a family they belong to. */
export function listTodos(userId: string) {
  const inUsersFamily = exists(
    db
      .select({ one: sql`1` })
      .from(familyMembers)
      .where(and(eq(familyMembers.family_id, todos.family_id), eq(familyMembers.user_id, userId)))
  );
  return db
    .select()
    .from(todos)
    .where(or(eq(todos.owner_id, userId), inUsersFamily))
    .orderBy(sql`${todos.due_date} asc nulls last`, desc(todos.created_at));
}

export function createTodo(userId: string, input: CreateTodoInput) {
  return db.transaction(async (tx) => {
    const scope = input.scope ?? (input.family_id ? "family" : "personal");
    const familyId = scope === "family" ? input.family_id : null;
    if (scope === "family") {
      if (!familyId) throw badRequest("family_required", "family_id is required for family todos");
      if (!(await isMember(tx, userId, familyId))) throw forbidden("You are not a member of that family");
    }

    const [todo] = await tx
      .insert(todos)
      .values({
        ...cleanFields(input),
        title: input.title.trim(),
        owner_id: userId,
        scope,
        family_id: familyId,
      })
      .returning();

    await notify(tx, await assignedNotifications(tx, userId, todo!, todo!.assignee_ids ?? []));
    publish(await audience(tx, todo!), { type: "todo", action: "created", todo: todo! });
    return todo!;
  });
}

export function updateTodo(userId: string, id: string, patch: TodoInput) {
  return db.transaction(async (tx) => {
    const before = await accessibleTodo(tx, userId, id);
    const [after] = await tx.update(todos).set(cleanFields(patch)).where(eq(todos.id, id)).returning();

    const newAssignees = (after!.assignee_ids ?? []).filter((a) => !before.assignee_ids?.includes(a));
    const items: NewNotification[] = await assignedNotifications(tx, userId, after!, newAssignees);

    if (after!.status === "completed" && before.status !== "completed") {
      const recipients = new Set([after!.owner_id, ...(after!.assignee_ids ?? [])]);
      recipients.delete(userId);
      const name = await displayName(tx, userId);
      for (const user_id of recipients) {
        items.push({
          user_id,
          type: "todo_completed",
          title: "Task completed",
          body: `${name} completed "${after!.title}".`,
          data: { todo_id: after!.id, family_id: after!.family_id },
          initiator_id: userId,
        });
      }
    }

    await notify(tx, items);
    publish(await audience(tx, after!), { type: "todo", action: "updated", todo: after! });
    return after!;
  });
}

export async function deleteTodo(userId: string, id: string) {
  const [todo] = await db.select().from(todos).where(eq(todos.id, id));
  if (!todo) throw notFound("Todo not found");
  if (todo.owner_id !== userId) throw forbidden("Only the owner can delete a todo");
  await db.delete(todos).where(eq(todos.id, id));
  publish(await audience(db, todo), { type: "todo", action: "deleted", todo });
}

/** Flip past-due in-progress todos to overdue and notify owner + assignees. */
export function sweepOverdue() {
  return db.transaction(async (tx) => {
    const flipped = await tx
      .update(todos)
      .set({ status: "overdue" })
      .where(and(eq(todos.status, "in_progress"), lt(todos.due_date, new Date())))
      .returning();

    await notify(
      tx,
      flipped.flatMap((t) =>
        [...new Set([t.owner_id, ...(t.assignee_ids ?? [])])].map((user_id) => ({
          user_id,
          type: "todo_overdue" as const,
          title: "Task overdue",
          body: `"${t.title}" is past its due date.`,
          data: { todo_id: t.id, family_id: t.family_id },
        }))
      )
    );
    for (const t of flipped) publish(await audience(tx, t), { type: "todo", action: "updated", todo: t });
    return flipped.length;
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function accessibleTodo(tx: DbOrTx, userId: string, id: string) {
  const [todo] = await tx.select().from(todos).where(eq(todos.id, id));
  if (!todo) throw notFound("Todo not found");
  const allowed =
    todo.owner_id === userId || (todo.family_id !== null && (await isMember(tx, userId, todo.family_id)));
  if (!allowed) throw forbidden("You don't have access to this todo");
  return todo;
}

/** Who should see live changes to a todo: the whole family, or just the owner. */
async function audience(tx: DbOrTx, todo: Todo) {
  const ids = todo.family_id ? await memberIds(tx, todo.family_id) : [];
  return [todo.owner_id, ...(todo.assignee_ids ?? []), ...ids];
}

/** Normalise the editable fields; keys absent from `input` are left out. */
function cleanFields(input: TodoInput) {
  const set: Partial<typeof todos.$inferInsert> = {};
  if (input.title !== undefined) {
    set.title = input.title.trim();
    if (!set.title) throw badRequest("title_required", "Title is required");
  }
  if (input.description !== undefined) set.description = input.description?.trim() || null;
  if (input.category !== undefined) set.category = input.category || null;
  if (input.status !== undefined) set.status = input.status;
  if (input.priority !== undefined) set.priority = input.priority;
  if (input.repeat !== undefined) set.repeat = input.repeat;
  if (input.reminder_minutes !== undefined) set.reminder_minutes = input.reminder_minutes;
  if (input.assignee_ids !== undefined) {
    const ids = [...new Set(input.assignee_ids ?? [])];
    set.assignee_ids = ids.length ? ids : null;
  }
  if (input.due_date !== undefined) {
    const d = input.due_date ? new Date(input.due_date) : null;
    if (d && Number.isNaN(d.getTime())) throw badRequest("invalid_date", "due_date is not a valid date");
    set.due_date = d;
  }
  return set;
}

async function assignedNotifications(
  tx: DbOrTx,
  actorId: string,
  todo: Todo,
  assigneeIds: string[]
): Promise<NewNotification[]> {
  const recipients = assigneeIds.filter((id) => id !== actorId);
  if (recipients.length === 0) return [];
  const name = await displayName(tx, actorId);
  return recipients.map<NewNotification>((user_id) => ({
    user_id,
    type: "todo_assigned" as const,
    title: "New task assigned",
    body: `${name} assigned you "${todo.title}".`,
    data: { todo_id: todo.id, family_id: todo.family_id },
    initiator_id: actorId,
  }));
}

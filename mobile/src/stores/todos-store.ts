import { api, getUser, isNetworkError } from "@/lib/api";
import {
  commit,
  pendingCreatedTodos,
  pendingTodoIds,
  registerHandler,
} from "@/lib/outbox";
import { jsonStorage } from "@/lib/storage";
import { getAvatarUrl } from "@/lib/util";
import { FamilyMember, useFamilyStore } from "@/stores/family-store";
import { StatusEnum } from "@/type";
import { uuid } from "expo-modules-core";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Matches todos.status in the DB. */
export type TodoStatus = "in_progress" | "completed" | "overdue" | "archived";
/** Matches todos.scope in the DB. */
export type TodoScope = "personal" | "family";
export type TodoPriority = "low" | "medium" | "high";
export type TodoRepeat = "none" | "daily" | "weekly" | "monthly";

export interface Todo {
  id: string;
  scope: TodoScope;
  family_id: string | null;
  owner_id: string;
  title: string;
  description: string | null;
  category: string | null;
  assignee_ids: string[] | null;
  due_date: string | null;
  status: TodoStatus;
  priority: TodoPriority;
  repeat: TodoRepeat;
  /** Minutes before the due date; null = no reminder. */
  reminder_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string | null;
  category?: string | null;
  due_date?: string | null;
  scope?: TodoScope;
  assignee_ids?: string[] | null;
  priority?: TodoPriority;
  repeat?: TodoRepeat;
  reminder_minutes?: number | null;
}

/** `queued` is true when the change was saved locally and will sync later. */
export type MutationResult = { error: unknown; queued?: boolean };

interface TodosStore {
  todos: Todo[];
  loading: boolean;
  error: string | null;

  /** `silent` refreshes without flipping `loading` (background syncs). */
  fetchTodos: (opts?: { silent?: boolean }) => Promise<void>;
  createTodo: (input: CreateTodoInput) => Promise<MutationResult>;
  updateTodo: (
    id: string,
    patch: Partial<CreateTodoInput>
  ) => Promise<MutationResult>;
  setStatus: (id: string, status: TodoStatus) => Promise<MutationResult>;
  toggleComplete: (id: string, completed: boolean) => Promise<MutationResult>;
  archiveTodo: (id: string) => Promise<MutationResult>;
  deleteTodo: (id: string) => Promise<MutationResult>;
  /** Apply a change pushed over the realtime socket. */
  applyRemote: (action: "created" | "updated" | "deleted", todo: Todo) => void;
  clear: () => void;
}

/**
 * Local-first: every mutation updates the list immediately, then is
 * committed through the outbox (sent now, or queued until we're online).
 * The list itself is persisted so it's there on a cold, offline start.
 */
export const useTodosStore = create<TodosStore>()(
  persist(
    (set, get) => ({
      todos: [],
      loading: false,
      error: null,

      fetchTodos: async (opts) => {
        if (!opts?.silent) set({ loading: true, error: null });
        try {
          if (!getUser()) {
            set({ todos: [], loading: false, error: "User not authenticated" });
            return;
          }
          // The server returns the user's personal todos + their family's
          // todos, already sorted by due date (nulls last) then newest first.
          const data = await api.get<Todo[]>("/todos");
          set({
            todos: mergeWithPending(data, get().todos),
            loading: false,
            error: null,
          });
        } catch (err: unknown) {
          if (!isNetworkError(err)) console.error("[TODOS] fetch error:", err);
          // Offline: keep what we have, quietly.
          set({
            loading: false,
            error: isNetworkError(err)
              ? null
              : err instanceof Error
                ? err.message
                : "Failed to fetch todos",
          });
        }
      },

      createTodo: async (input) => {
        const user = getUser();
        if (!user) return { error: "User not authenticated" };

        const familyId = useFamilyStore.getState().familyId;
        const scope: TodoScope =
          input.scope ?? (familyId ? "family" : "personal");
        const now = new Date().toISOString();
        const todo: Todo = {
          id: uuid.v4(),
          scope,
          family_id: scope === "family" ? familyId : null,
          owner_id: user.id,
          title: input.title.trim(),
          description: input.description?.trim() || null,
          category: input.category ?? null,
          assignee_ids: input.assignee_ids?.length ? input.assignee_ids : null,
          due_date: input.due_date ?? null,
          status: "in_progress",
          priority: input.priority ?? "medium",
          repeat: input.repeat ?? "none",
          reminder_minutes: input.reminder_minutes ?? null,
          created_at: now,
          updated_at: now,
        };

        set({ todos: upsertTodo(get().todos, todo) });
        try {
          const { queued } = await commit({ kind: "todo.create", todo });
          return { error: null, queued };
        } catch (err) {
          console.error("[TODOS] create error:", err);
          set({ todos: get().todos.filter((t) => t.id !== todo.id) });
          return { error: err };
        }
      },

      updateTodo: async (id, patch) => {
        const body: Record<string, unknown> = {};
        if (patch.title !== undefined) body.title = patch.title.trim();
        if (patch.description !== undefined)
          body.description = patch.description?.trim() || null;
        if (patch.category !== undefined)
          body.category = patch.category ?? null;
        if (patch.due_date !== undefined)
          body.due_date = patch.due_date ?? null;
        if (patch.assignee_ids !== undefined)
          body.assignee_ids = patch.assignee_ids?.length
            ? patch.assignee_ids
            : null;
        if (patch.priority !== undefined) body.priority = patch.priority;
        if (patch.repeat !== undefined) body.repeat = patch.repeat;
        if (patch.reminder_minutes !== undefined)
          body.reminder_minutes = patch.reminder_minutes ?? null;
        return applyPatch(id, body);
      },

      setStatus: (id, status) => applyPatch(id, { status }),

      toggleComplete: (id, completed) =>
        get().setStatus(id, completed ? "completed" : "in_progress"),

      archiveTodo: (id) => get().setStatus(id, "archived"),

      deleteTodo: async (id) => {
        const prev = get().todos;
        set({ todos: prev.filter((t) => t.id !== id) });
        try {
          const { queued } = await commit({ kind: "todo.delete", todoId: id });
          return { error: null, queued };
        } catch (err) {
          console.error("[TODOS] delete error:", err);
          set({ todos: prev });
          return { error: err };
        }
      },

      applyRemote: (action, todo) => {
        // A queued local change beats whatever the server just pushed.
        if (pendingTodoIds().has(todo.id)) return;
        set({
          todos:
            action === "deleted"
              ? get().todos.filter((t) => t.id !== todo.id)
              : upsertTodo(get().todos, todo),
        });
      },

      clear: () => set({ todos: [], error: null }),
    }),
    {
      name: "tasknest.todos",
      storage: jsonStorage(),
      partialize: (s) => ({ todos: s.todos }),
    }
  )
);

/** Optimistically merge `patch` into a todo, then commit it. */
async function applyPatch(
  id: string,
  patch: Record<string, unknown>
): Promise<MutationResult> {
  const prev = useTodosStore.getState().todos;
  if (!prev.some((t) => t.id === id)) return { error: "Todo not found" };
  useTodosStore.setState({
    todos: sortTodos(
      prev.map((t) =>
        t.id === id
          ? ({ ...t, ...patch, updated_at: new Date().toISOString() } as Todo)
          : t
      )
    ),
  });
  try {
    const { queued } = await commit({ kind: "todo.update", todoId: id, patch });
    return { error: null, queued };
  } catch (err) {
    console.error("[TODOS] update error:", err);
    useTodosStore.setState({ todos: prev });
    return { error: err };
  }
}

/** Server truth, except for todos with unsent local changes. */
function mergeWithPending(server: Todo[], local: Todo[]): Todo[] {
  const pending = pendingTodoIds();
  if (pending.size === 0) return server;
  const localById = new Map(local.map((t) => [t.id, t]));
  const merged = server.map((t) =>
    pending.has(t.id) ? (localById.get(t.id) ?? t) : t
  );
  const known = new Set(merged.map((t) => t.id));
  for (const t of pendingCreatedTodos()) {
    if (!known.has(t.id)) merged.push(localById.get(t.id) ?? t);
  }
  return sortTodos(merged);
}

// --- outbox handlers ----------------------------------------------------------
// How each queued op reaches the server. The response replaces the local
// copy unless a later queued change for the same todo is still waiting.
function applyServer(todo: Todo) {
  if (pendingTodoIds().has(todo.id)) return;
  useTodosStore.setState((s) => ({ todos: upsertTodo(s.todos, todo) }));
}

registerHandler("todo.create", async ({ todo }) => {
  const saved = await api.post<Todo>("/todos", {
    id: todo.id,
    scope: todo.scope,
    family_id: todo.family_id,
    title: todo.title,
    description: todo.description,
    category: todo.category,
    due_date: todo.due_date,
    assignee_ids: todo.assignee_ids,
    priority: todo.priority,
    repeat: todo.repeat,
    reminder_minutes: todo.reminder_minutes,
  });
  applyServer(saved);
});

registerHandler("todo.update", async ({ todoId, patch }) => {
  const saved = await api.patch<Todo>(`/todos/${todoId}`, patch);
  applyServer(saved);
});

registerHandler("todo.delete", async ({ todoId }) => {
  await api.delete(`/todos/${todoId}`);
});

// ---------------------------------------------------------------------------
// Derivation helpers (kept out of the store so components stay declarative)
// ---------------------------------------------------------------------------

export type TodoStatusCounts = Record<TodoStatus, number>;

/** Insert or replace `todo` by id, keeping the list sorted. Never duplicates. */
export function upsertTodo(todos: Todo[], todo: Todo): Todo[] {
  return sortTodos([todo, ...todos.filter((t) => t.id !== todo.id)]);
}

/** Sort todos the way fetchTodos does: due date asc (nulls last), then newest first. */
export function sortTodos(todos: Todo[]): Todo[] {
  return [...todos].sort((a, b) => {
    const ad = a.due_date ? new Date(a.due_date).getTime() : Infinity;
    const bd = b.due_date ? new Date(b.due_date).getTime() : Infinity;
    if (ad !== bd) return ad - bd;
    const ac = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bc = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bc - ac;
  });
}

export function countByStatus(todos: Todo[]): TodoStatusCounts {
  const counts: TodoStatusCounts = {
    in_progress: 0,
    completed: 0,
    overdue: 0,
    archived: 0,
  };
  for (const t of todos) counts[t.status] += 1;
  return counts;
}

/** Count of active (non-archived) todos per category id. */
export function countByCategory(todos: Todo[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const t of todos) {
    if (t.status === "archived" || !t.category) continue;
    counts[t.category] = (counts[t.category] ?? 0) + 1;
  }
  return counts;
}

export function todoStatusToEnum(status: TodoStatus): StatusEnum {
  switch (status) {
    case "completed":
      return StatusEnum.COMPLETED;
    case "overdue":
      return StatusEnum.OVERDUE;
    case "archived":
      return StatusEnum.ARCHIVED;
    default:
      return StatusEnum.TODO;
  }
}

/** Resolve assignee avatar URLs from the current family members. */
export function assigneeAvatarUris(
  assigneeIds: string[] | null | undefined,
  members: FamilyMember[]
): string[] {
  if (!assigneeIds?.length) return [];
  return assigneeIds
    .map((id) => members.find((m) => m.user_id === id))
    .map((m) => (m?.avatar_url ? getAvatarUrl(m.avatar_url) : null))
    .filter((url): url is string => !!url);
}

/** Resolve assignee display names from the current family members. */
export function assigneeNames(
  assigneeIds: string[] | null | undefined,
  members: FamilyMember[]
): string[] {
  if (!assigneeIds?.length) return [];
  return assigneeIds
    .map((id) => members.find((m) => m.user_id === id)?.name)
    .filter((name): name is string => !!name);
}

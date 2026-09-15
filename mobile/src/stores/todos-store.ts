import { api, getUser } from "@/lib/api";
import { getAvatarUrl } from "@/lib/util";
import { FamilyMember, useFamilyStore } from "@/stores/family-store";
import { StatusEnum } from "@/type";
import { create } from "zustand";

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

interface TodosStore {
  todos: Todo[];
  loading: boolean;
  error: string | null;

  fetchTodos: () => Promise<void>;
  createTodo: (input: CreateTodoInput) => Promise<{ error: unknown }>;
  updateTodo: (
    id: string,
    patch: Partial<CreateTodoInput>
  ) => Promise<{ error: unknown }>;
  setStatus: (id: string, status: TodoStatus) => Promise<{ error: unknown }>;
  toggleComplete: (
    id: string,
    completed: boolean
  ) => Promise<{ error: unknown }>;
  archiveTodo: (id: string) => Promise<{ error: unknown }>;
  deleteTodo: (id: string) => Promise<{ error: unknown }>;
  /** Apply a change pushed over the realtime socket. */
  applyRemote: (action: "created" | "updated" | "deleted", todo: Todo) => void;
  clear: () => void;
}

export const useTodosStore = create<TodosStore>((set, get) => ({
  todos: [],
  loading: false,
  error: null,

  fetchTodos: async () => {
    set({ loading: true, error: null });
    try {
      if (!getUser()) {
        set({ todos: [], loading: false, error: "User not authenticated" });
        return;
      }

      // The server returns the user's personal todos + their family's todos,
      // already sorted by due date (nulls last) then newest first.
      const data = await api.get<Todo[]>("/todos");
      set({ todos: data, loading: false, error: null });
    } catch (err: unknown) {
      console.error("[TODOS] fetch error:", err);
      const message =
        err instanceof Error ? err.message : "Failed to fetch todos";
      set({ loading: false, error: message });
    }
  },

  createTodo: async (input) => {
    try {
      if (!getUser()) return { error: "User not authenticated" };

      const familyId = useFamilyStore.getState().familyId;
      const scope: TodoScope =
        input.scope ?? (familyId ? "family" : "personal");

      const data = await api.post<Todo>("/todos", {
        scope,
        family_id: scope === "family" ? familyId : null,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        category: input.category ?? null,
        due_date: input.due_date ?? null,
        assignee_ids: input.assignee_ids ?? null,
        priority: input.priority ?? "medium",
        repeat: input.repeat ?? "none",
        reminder_minutes: input.reminder_minutes ?? null,
      });

      // The realtime "created" event can land before this response, so
      // upsert rather than prepend to avoid a duplicate row.
      set({ todos: upsertTodo(get().todos, data) });
      return { error: null };
    } catch (err: unknown) {
      console.error("[TODOS] create error:", err);
      return { error: err };
    }
  },

  updateTodo: async (id, patch) => {
    try {
      const body: Record<string, unknown> = {};
      if (patch.title !== undefined) body.title = patch.title.trim();
      if (patch.description !== undefined)
        body.description = patch.description?.trim() || null;
      if (patch.category !== undefined) body.category = patch.category ?? null;
      if (patch.due_date !== undefined) body.due_date = patch.due_date ?? null;
      if (patch.assignee_ids !== undefined)
        body.assignee_ids = patch.assignee_ids ?? null;
      if (patch.priority !== undefined) body.priority = patch.priority;
      if (patch.repeat !== undefined) body.repeat = patch.repeat;
      if (patch.reminder_minutes !== undefined)
        body.reminder_minutes = patch.reminder_minutes ?? null;

      const updated = await api.patch<Todo>(`/todos/${id}`, body);
      set({ todos: upsertTodo(get().todos, updated) });
      return { error: null };
    } catch (error) {
      console.error("[TODOS] update error:", error);
      return { error };
    }
  },

  setStatus: async (id, status) => {
    const prev = get().todos;
    // Optimistic update
    set({
      todos: prev.map((t) =>
        t.id === id ? { ...t, status, updated_at: new Date().toISOString() } : t
      ),
    });

    try {
      const updated = await api.patch<Todo>(`/todos/${id}`, { status });
      set({ todos: upsertTodo(get().todos, updated) });
      return { error: null };
    } catch (error) {
      console.error("[TODOS] setStatus error:", error);
      set({ todos: prev }); // rollback
      return { error };
    }
  },

  toggleComplete: async (id, completed) =>
    get().setStatus(id, completed ? "completed" : "in_progress"),

  archiveTodo: async (id) => get().setStatus(id, "archived"),

  deleteTodo: async (id) => {
    const prev = get().todos;
    set({ todos: prev.filter((t) => t.id !== id) });

    try {
      await api.delete(`/todos/${id}`);
      return { error: null };
    } catch (error) {
      console.error("[TODOS] delete error:", error);
      set({ todos: prev }); // rollback
      return { error };
    }
  },

  applyRemote: (action, todo) => {
    set({
      todos:
        action === "deleted"
          ? get().todos.filter((t) => t.id !== todo.id)
          : upsertTodo(get().todos, todo),
    });
  },

  clear: () => set({ todos: [], error: null }),
}));

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

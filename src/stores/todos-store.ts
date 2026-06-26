import { supabase } from "@/lib/supabase";
import { getAvatarUrl } from "@/lib/util";
import { FamilyMember, useFamilyStore } from "@/stores/family-store";
import { StatusEnum } from "@/type";
import { create } from "zustand";

/** Matches todos.status in the DB. */
export type TodoStatus = "in_progress" | "completed" | "overdue" | "archived";
/** Matches todos.scope in the DB. */
export type TodoScope = "personal" | "family";

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
}

interface TodosStore {
  todos: Todo[];
  loading: boolean;
  error: string | null;

  fetchTodos: () => Promise<void>;
  createTodo: (input: CreateTodoInput) => Promise<{ error: unknown }>;
  setStatus: (id: string, status: TodoStatus) => Promise<{ error: unknown }>;
  toggleComplete: (
    id: string,
    completed: boolean
  ) => Promise<{ error: unknown }>;
  archiveTodo: (id: string) => Promise<{ error: unknown }>;
  deleteTodo: (id: string) => Promise<{ error: unknown }>;
  clear: () => void;
}

export const useTodosStore = create<TodosStore>((set, get) => ({
  todos: [],
  loading: false,
  error: null,

  fetchTodos: async () => {
    set({ loading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        set({ todos: [], loading: false, error: "User not authenticated" });
        return;
      }

      // RLS restricts rows to the user's personal todos + their families' todos.
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[TODOS] fetch error:", error);
        set({ loading: false, error: error.message });
        return;
      }

      set({ todos: (data ?? []) as Todo[], loading: false, error: null });
    } catch (err: unknown) {
      console.error("[TODOS] unexpected error:", err);
      const message =
        err instanceof Error ? err.message : "Failed to fetch todos";
      set({ loading: false, error: message });
    }
  },

  createTodo: async (input) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return { error: "User not authenticated" };

      const familyId = useFamilyStore.getState().familyId;
      const scope: TodoScope =
        input.scope ?? (familyId ? "family" : "personal");

      const payload = {
        owner_id: user.id,
        scope,
        family_id: scope === "family" ? familyId : null,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        category: input.category ?? null,
        due_date: input.due_date ?? null,
        assignee_ids: input.assignee_ids ?? null,
        status: "in_progress" as TodoStatus,
      };

      const { data, error } = await supabase
        .from("todos")
        .insert(payload)
        .select("*")
        .single();

      if (error) {
        console.error("[TODOS] create error:", error);
        return { error };
      }

      set({ todos: sortTodos([data as Todo, ...get().todos]) });
      return { error: null };
    } catch (err: unknown) {
      console.error("[TODOS] create unexpected:", err);
      return { error: err };
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

    const { error } = await supabase
      .from("todos")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error("[TODOS] setStatus error:", error);
      set({ todos: prev }); // rollback
      return { error };
    }
    return { error: null };
  },

  toggleComplete: async (id, completed) =>
    get().setStatus(id, completed ? "completed" : "in_progress"),

  archiveTodo: async (id) => get().setStatus(id, "archived"),

  deleteTodo: async (id) => {
    const prev = get().todos;
    set({ todos: prev.filter((t) => t.id !== id) });

    const { error } = await supabase.from("todos").delete().eq("id", id);

    if (error) {
      console.error("[TODOS] delete error:", error);
      set({ todos: prev }); // rollback
      return { error };
    }
    return { error: null };
  },

  clear: () => set({ todos: [], error: null }),
}));

// ---------------------------------------------------------------------------
// Derivation helpers (kept out of the store so components stay declarative)
// ---------------------------------------------------------------------------

export type TodoStatusCounts = Record<TodoStatus, number>;

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

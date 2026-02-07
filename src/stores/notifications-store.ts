import { supabase } from "@/lib/supabase";
import { create } from "zustand";

export interface AppNotification {
  id: string;
  title: string | null;
  body: string | null;
  created_at: string;
  read_at: string | null;
  /** Full row from the database for flexible future use */
  raw: any;
  type: NotificationType;
  initiator_id: string | null;
}

export enum NotificationType {
  FAMILY_INVITE_RECEIVED = "family_invite_received",
  FAMILY_INVITE_ACCEPTED = "family_invite_accepted",
  JOIN_REQUEST_RECEIVED = "join_request_received",
  JOIN_REQUEST_APPROVED = "join_request_approved",
  TODO_ASSIGNED = "todo_assigned",
  TODO_COMPLETED = "todo_completed",
  TODO_OVERDUE = "todo_overdue",
  FAMILY_ARCHIVED = "family_archived",
}

interface NotificationsStore {
  notifications: AppNotification[];
  loading: boolean;
  error: string | null;

  fetchNotifications: () => Promise<void>;
  markAsReadLocally: (id: string) => void;
  clear: () => void;
}

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
  notifications: [],
  loading: false,
  error: null,

  fetchNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("[NOTIFICATIONS] fetch error:", error);
        set({ loading: false, error: error.message });
        return;
      }

      const mapped: AppNotification[] = (data ?? []).map((row: any) => ({
        id: String(row.id),
        title: row.title ?? null,
        body: row.body ?? null,
        created_at: row.created_at ?? new Date().toISOString(),
        read_at: row.read_at ?? null,
        raw: row,
        type: row.type as NotificationType,
        initiator_id: row.initiator_id ?? null,
      }));

      set({ notifications: mapped, loading: false, error: null });
    } catch (err: any) {
      console.error("[NOTIFICATIONS] unexpected error:", err);
      set({
        loading: false,
        error: err?.message ?? "Failed to fetch notifications",
      });
    }
  },

  markAsReadLocally: (id: string) => {
    const notifications = get().notifications.map((n) =>
      n.id === id ? { ...n, read_at: n.read_at ?? new Date().toISOString() } : n
    );
    set({ notifications });
  },

  clear: () => {
    set({ notifications: [], error: null });
  },
}));

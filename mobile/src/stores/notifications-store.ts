import { api, errorMessage } from "@/lib/api";
import { create } from "zustand";

export interface AppNotification {
  id: string;
  title: string | null;
  body: string | null;
  created_at: string;
  read_at: string | null;
  /** Full row from the server for flexible future use */
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

type NotificationRow = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string | null;
  body: string | null;
  data: Record<string, unknown> | null;
  initiator_id: string | null;
  read_at: string | null;
  created_at: string;
};

interface NotificationsStore {
  notifications: AppNotification[];
  loading: boolean;
  error: string | null;

  fetchNotifications: () => Promise<void>;
  /** Insert a notification pushed over the realtime socket. */
  receive: (row: unknown) => void;
  markAsReadLocally: (id: string) => void;
  /** Merge `patch` into a notification's `data` and mark it read (server + local). */
  patchNotificationData: (
    id: string,
    patch: Record<string, unknown>
  ) => Promise<{ error: unknown }>;
  clear: () => void;
}

const toAppNotification = (row: NotificationRow): AppNotification => ({
  id: String(row.id),
  title: row.title ?? null,
  body: row.body ?? null,
  created_at: row.created_at ?? new Date().toISOString(),
  read_at: row.read_at ?? null,
  raw: row,
  type: row.type,
  initiator_id: row.initiator_id ?? null,
});

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
  notifications: [],
  loading: false,
  error: null,

  fetchNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const rows = await api.get<NotificationRow[]>("/notifications", {
        limit: 50,
      });
      set({
        notifications: rows.map(toAppNotification),
        loading: false,
        error: null,
      });
    } catch (err: unknown) {
      console.error("[NOTIFICATIONS] fetch error:", err);
      set({
        loading: false,
        error: errorMessage(err, "Failed to fetch notifications"),
      });
    }
  },

  receive: (row) => {
    const item = toAppNotification(row as NotificationRow);
    const rest = get().notifications.filter((n) => n.id !== item.id);
    set({ notifications: [item, ...rest] });
  },

  markAsReadLocally: (id: string) => {
    const notifications = get().notifications.map((n) =>
      n.id === id ? { ...n, read_at: n.read_at ?? new Date().toISOString() } : n
    );
    set({ notifications });
  },

  patchNotificationData: async (id, patch) => {
    const current = get().notifications.find((n) => n.id === id);
    const nextData = { ...(current?.raw?.data ?? {}), ...patch };
    const nextReadAt = current?.read_at ?? new Date().toISOString();

    // Optimistic local update
    set({
      notifications: get().notifications.map((n) =>
        n.id === id
          ? { ...n, read_at: nextReadAt, raw: { ...n.raw, data: nextData } }
          : n
      ),
    });

    try {
      const row = await api.patch<NotificationRow>(`/notifications/${id}`, {
        data: patch,
        read_at: nextReadAt,
      });
      set({
        notifications: get().notifications.map((n) =>
          n.id === id ? toAppNotification(row) : n
        ),
      });
      return { error: null };
    } catch (error) {
      console.error("[NOTIFICATIONS] patch error:", error);
      return { error };
    }
  },

  clear: () => {
    set({ notifications: [], error: null });
  },
}));

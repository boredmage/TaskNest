import { api, errorMessage, isNetworkError } from "@/lib/api";
import { commit, registerHandler } from "@/lib/outbox";
import { jsonStorage } from "@/lib/storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  TODO_REMINDER = "todo_reminder",
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

  /** `silent` refreshes without flipping `loading` (background syncs). */
  fetchNotifications: (opts?: { silent?: boolean }) => Promise<void>;
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

export const useNotificationsStore = create<NotificationsStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      loading: false,
      error: null,

      fetchNotifications: async (opts) => {
        if (!opts?.silent) set({ loading: true, error: null });
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
          if (!isNetworkError(err))
            console.error("[NOTIFICATIONS] fetch error:", err);
          set({
            loading: false,
            error: isNetworkError(err)
              ? null
              : errorMessage(err, "Failed to fetch notifications"),
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
          n.id === id
            ? { ...n, read_at: n.read_at ?? new Date().toISOString() }
            : n
        );
        set({ notifications });
      },

      patchNotificationData: async (id, patch) => {
        const current = get().notifications.find((n) => n.id === id);
        const nextData = { ...(current?.raw?.data ?? {}), ...patch };
        const nextReadAt = current?.read_at ?? new Date().toISOString();

        // Optimistic local update; committed now or queued until online.
        set({
          notifications: get().notifications.map((n) =>
            n.id === id
              ? { ...n, read_at: nextReadAt, raw: { ...n.raw, data: nextData } }
              : n
          ),
        });

        try {
          const { queued } = await commit({
            kind: "notification.patch",
            notificationId: id,
            patch: { data: patch, read_at: nextReadAt },
          });
          return { error: null, queued };
        } catch (error) {
          console.error("[NOTIFICATIONS] patch error:", error);
          return { error };
        }
      },

      clear: () => {
        set({ notifications: [], error: null });
      },
    }),
    {
      name: "tasknest.notifications",
      storage: jsonStorage(),
      partialize: (s) => ({ notifications: s.notifications }),
    }
  )
);

registerHandler("notification.patch", async ({ notificationId, patch }) => {
  const row = await api.patch<NotificationRow>(
    `/notifications/${notificationId}`,
    patch
  );
  useNotificationsStore.setState((s) => ({
    notifications: s.notifications.map((n) =>
      n.id === notificationId ? toAppNotification(row) : n
    ),
  }));
});

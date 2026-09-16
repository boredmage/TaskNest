import { getUser } from "@/lib/api";
import { isOnline, onOnline } from "@/lib/connectivity";
import { flushOutbox } from "@/lib/outbox";
import { useFamilyStore } from "@/stores/family-store";
import { useNotificationsStore } from "@/stores/notifications-store";
import { useTodosStore } from "@/stores/todos-store";

/**
 * The one way the app catches up with the server: replay anything queued
 * offline, then quietly refetch. Called when we come back online, when the
 * app returns to the foreground, when a push arrives, and on family changes.
 * Concurrent calls share one run.
 */
let running: Promise<void> | null = null;

export function sync(reason: string): Promise<void> {
  if (!getUser() || !isOnline()) return Promise.resolve();
  if (running) return running;
  running = (async () => {
    try {
      await flushOutbox();
      await Promise.all([
        useTodosStore.getState().fetchTodos({ silent: true }),
        useNotificationsStore.getState().fetchNotifications({ silent: true }),
        useFamilyStore.getState().fetchFamily({ silent: true }),
      ]);
    } catch (e) {
      console.warn(`[sync:${reason}] failed`, e);
    } finally {
      running = null;
    }
  })();
  return running;
}

// Coming back online is the most important trigger of all.
onOnline(() => {
  void sync("online");
});

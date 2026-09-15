import type { WSContext } from "hono/ws";
import type { Notification, Todo } from "../db/index.ts";

/**
 * Live updates over WebSocket. Each signed-in device holds one socket; the
 * services call `publish` after they change something so every affected
 * user's app updates without polling.
 */
export type RealtimeEvent =
  | { type: "notification"; notification: Notification }
  | { type: "todo"; action: "created" | "updated" | "deleted"; todo: Todo }
  | { type: "family"; action: "changed"; family_id: string };

const sockets = new Map<string, Set<WSContext>>();

export function subscribe(userId: string, ws: WSContext) {
  let set = sockets.get(userId);
  if (!set) sockets.set(userId, (set = new Set()));
  set.add(ws);
}

export function unsubscribe(userId: string, ws: WSContext) {
  const set = sockets.get(userId);
  if (!set) return;
  set.delete(ws);
  if (set.size === 0) sockets.delete(userId);
}

/** Send `event` to every open socket of every listed user (deduplicated). */
export function publish(userIds: Iterable<string>, event: RealtimeEvent) {
  const data = JSON.stringify(event);
  for (const userId of new Set(userIds)) {
    for (const ws of sockets.get(userId) ?? []) {
      try {
        if (ws.readyState === 1) ws.send(data);
      } catch (e) {
        console.warn("[realtime] send failed", e);
      }
    }
  }
}

import { API_URL, getSession, refreshIfNeeded } from "@/lib/api";
import { reportOnline } from "@/lib/connectivity";
import { sync } from "@/lib/sync";
import { useNotificationsStore } from "@/stores/notifications-store";
import { useTodosStore, type Todo } from "@/stores/todos-store";
import { AppState, type AppStateStatus } from "react-native";

/**
 * Live updates. One WebSocket per signed-in session; the server pushes
 * notification, todo and family events and the stores apply them, so task
 * assignments, News items and status changes appear without a refresh.
 */
type RealtimeEvent =
  | { type: "notification"; notification: Record<string, unknown> }
  | { type: "todo"; action: "created" | "updated" | "deleted"; todo: Todo }
  | { type: "family"; action: "changed"; family_id: string };

const PING_MS = 25_000;
const MAX_BACKOFF_MS = 30_000;

let socket: WebSocket | null = null;
let running = false;
let attempts = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let pingTimer: ReturnType<typeof setInterval> | null = null;
let appStateSub: { remove: () => void } | null = null;

export function startRealtime() {
  if (running) return;
  running = true;
  attempts = 0;
  appStateSub = AppState.addEventListener("change", onAppState);
  connect();
}

export function stopRealtime() {
  running = false;
  appStateSub?.remove();
  appStateSub = null;
  clearTimers();
  socket?.close();
  socket = null;
}

async function connect() {
  if (!running) return;
  // A token that is about to expire would be rejected at the handshake.
  const session = (await refreshIfNeeded(120)) ?? getSession();
  if (!session || !running) return;

  const url = `${API_URL.replace(/^http/, "ws")}/v1/realtime?token=${encodeURIComponent(session.access_token)}`;
  const ws = new WebSocket(url);
  socket = ws;

  ws.onopen = () => {
    reportOnline();
    attempts = 0;
    pingTimer = setInterval(() => ws.send("ping"), PING_MS);
  };
  ws.onmessage = (msg) => {
    if (typeof msg.data !== "string" || msg.data === "pong") return;
    try {
      handle(JSON.parse(msg.data) as RealtimeEvent);
    } catch (e) {
      console.warn("[realtime] bad event", e);
    }
  };
  ws.onerror = () => {
    /* onclose follows and schedules the retry */
  };
  ws.onclose = () => {
    if (socket === ws) socket = null;
    clearTimers();
    if (running) scheduleReconnect();
  };
}

function scheduleReconnect() {
  const delay = Math.min(1000 * 2 ** attempts, MAX_BACKOFF_MS);
  attempts += 1;
  reconnectTimer = setTimeout(connect, delay);
}

function clearTimers() {
  if (pingTimer) clearInterval(pingTimer);
  if (reconnectTimer) clearTimeout(reconnectTimer);
  pingTimer = null;
  reconnectTimer = null;
}

/** Coming back to the foreground: reconnect at once and catch up on anything missed. */
function onAppState(state: AppStateStatus) {
  if (state !== "active" || !running) return;
  if (!socket || socket.readyState > WebSocket.OPEN) {
    clearTimers();
    attempts = 0;
    connect();
  }
  void sync("foreground");
}

function handle(event: RealtimeEvent) {
  switch (event.type) {
    case "notification":
      useNotificationsStore.getState().receive(event.notification);
      break;
    case "todo":
      useTodosStore.getState().applyRemote(event.action, event.todo);
      break;
    case "family":
      void sync("realtime");
      break;
  }
}

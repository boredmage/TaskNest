import { ApiError, isNetworkError } from "@/lib/api";
import { isOnline } from "@/lib/connectivity";
import type { Todo } from "@/stores/todos-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

/**
 * Persisted queue of mutations made while offline (or that failed at the
 * network level). Stores apply every change locally first, then `commit` it:
 * online it runs at once, otherwise it waits here and `flushOutbox` replays
 * the queue in order the next time we're connected.
 *
 * Ops on the same record are coalesced so the queue stays small and replays
 * cleanly: edits fold into a pending create, repeated edits merge, and a
 * delete cancels a pending create outright.
 */
export type Op =
  | { kind: "todo.create"; todo: Todo }
  | { kind: "todo.update"; todoId: string; patch: Record<string, unknown> }
  | { kind: "todo.delete"; todoId: string }
  | {
      kind: "notification.patch";
      notificationId: string;
      patch: Record<string, unknown>;
    }
  | { kind: "profile.update"; updates: Record<string, unknown> };

export type OpKind = Op["kind"];
type Handler<K extends OpKind> = (
  op: Extract<Op, { kind: K }>
) => Promise<void>;

const handlers: Partial<{ [K in OpKind]: Handler<K> }> = {};

/** Stores register how each op kind is sent to the server. */
export function registerHandler<K extends OpKind>(kind: K, fn: Handler<K>) {
  handlers[kind] = fn as never;
}

// --- state -------------------------------------------------------------------
interface OutboxState {
  /** Number of queued ops, for the offline banner. */
  pending: number;
  flushing: boolean;
}
export const useOutbox = create<OutboxState>(() => ({
  pending: 0,
  flushing: false,
}));

let ops: Op[] = [];
let storageKey: string | null = null;

const keyFor = (userId: string) => `tasknest.outbox.${userId}`;

/** Load the signed-in user's queue. Call once per sign-in before syncing. */
export async function loadOutbox(userId: string) {
  storageKey = keyFor(userId);
  try {
    const raw = await AsyncStorage.getItem(storageKey);
    ops = raw ? (JSON.parse(raw) as Op[]) : [];
  } catch {
    ops = [];
  }
  useOutbox.setState({ pending: ops.length });
}

export function unloadOutbox() {
  ops = [];
  storageKey = null;
  useOutbox.setState({ pending: 0, flushing: false });
}

async function save() {
  useOutbox.setState({ pending: ops.length });
  if (!storageKey) return;
  try {
    await AsyncStorage.setItem(storageKey, JSON.stringify(ops));
  } catch (e) {
    console.warn("[outbox] failed to persist", e);
  }
}

export const hasPending = () => ops.length > 0;

/** Ids of todos with queued changes (their local copy beats server data). */
export function pendingTodoIds(): Set<string> {
  const ids = new Set<string>();
  for (const op of ops) {
    if (op.kind === "todo.create") ids.add(op.todo.id);
    else if (op.kind === "todo.update" || op.kind === "todo.delete")
      ids.add(op.todoId);
  }
  return ids;
}

/** Todos created offline that the server doesn't know about yet. */
export function pendingCreatedTodos(): Todo[] {
  return ops.flatMap((op) => (op.kind === "todo.create" ? [op.todo] : []));
}

// --- enqueue with coalescing ------------------------------------------------
export async function enqueue(op: Op) {
  switch (op.kind) {
    case "todo.update": {
      const created = ops.find(
        (o): o is Extract<Op, { kind: "todo.create" }> =>
          o.kind === "todo.create" && o.todo.id === op.todoId
      );
      if (created) {
        // Fold the edit into the unsent create.
        created.todo = { ...created.todo, ...op.patch } as Todo;
        break;
      }
      const prev = ops.find(
        (o): o is Extract<Op, { kind: "todo.update" }> =>
          o.kind === "todo.update" && o.todoId === op.todoId
      );
      if (prev) prev.patch = { ...prev.patch, ...op.patch };
      else ops.push(op);
      break;
    }
    case "todo.delete": {
      const hadCreate = ops.some(
        (o) => o.kind === "todo.create" && o.todo.id === op.todoId
      );
      ops = ops.filter(
        (o) =>
          !(o.kind === "todo.create" && o.todo.id === op.todoId) &&
          !(o.kind === "todo.update" && o.todoId === op.todoId)
      );
      // A todo the server never saw needs no delete.
      if (!hadCreate) ops.push(op);
      break;
    }
    case "notification.patch": {
      const prev = ops.find(
        (o): o is Extract<Op, { kind: "notification.patch" }> =>
          o.kind === "notification.patch" &&
          o.notificationId === op.notificationId
      );
      if (prev) prev.patch = { ...prev.patch, ...op.patch };
      else ops.push(op);
      break;
    }
    case "profile.update": {
      const prev = ops.find(
        (o): o is Extract<Op, { kind: "profile.update" }> =>
          o.kind === "profile.update"
      );
      if (prev) prev.updates = { ...prev.updates, ...op.updates };
      else ops.push(op);
      break;
    }
    default:
      ops.push(op);
  }
  await save();
}

// --- commit / flush ------------------------------------------------------------
export type CommitResult = { queued: boolean };

/**
 * Send `op` now if we're online, otherwise queue it. A network failure while
 * sending also queues it. Server rejections (4xx) are thrown to the caller,
 * which should roll back its optimistic change.
 */
export async function commit(op: Op): Promise<CommitResult> {
  if (!isOnline() || hasPending()) {
    // Keep ordering: if anything is already queued, this must follow it.
    await enqueue(op);
    if (isOnline()) void flushOutbox();
    return { queued: !isOnline() };
  }
  try {
    await run(op);
    return { queued: false };
  } catch (e) {
    if (isNetworkError(e)) {
      await enqueue(op);
      return { queued: true };
    }
    throw e;
  }
}

async function run(op: Op) {
  const handler = handlers[op.kind] as ((o: Op) => Promise<void>) | undefined;
  if (!handler) throw new Error(`[outbox] no handler for ${op.kind}`);
  await handler(op);
}

let flushing: Promise<void> | null = null;

/** Replay the queue in order. Stops at the first network failure. */
export function flushOutbox(): Promise<void> {
  if (flushing) return flushing;
  flushing = (async () => {
    if (ops.length === 0 || !isOnline()) return;
    useOutbox.setState({ flushing: true });
    try {
      while (ops.length > 0) {
        const op = ops[0]!;
        try {
          await run(op);
          ops.shift();
          await save();
        } catch (e) {
          if (isNetworkError(e)) return; // still offline; try again later
          if (e instanceof ApiError && e.status >= 500) return; // server hiccup
          // The server refused it (deleted record, validation…): nothing a
          // retry will fix. Drop it; the next fetch restores server truth.
          console.warn(`[outbox] dropping ${op.kind}:`, e);
          ops.shift();
          await save();
        }
      }
    } finally {
      useOutbox.setState({ flushing: false, pending: ops.length });
      flushing = null;
    }
  })();
  return flushing;
}

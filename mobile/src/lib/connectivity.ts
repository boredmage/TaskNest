import { AppState } from "react-native";
import { create } from "zustand";

/**
 * Are we online? Decided from evidence rather than a native reachability
 * module: any request that gets an HTTP response marks us online, any
 * request that fails at the network level marks us offline, and while
 * offline we probe the API's /health every few seconds (only while the app
 * is in the foreground) so recovery is noticed within seconds.
 */
const HEALTH_URL = `${(process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/$/, "")}/health`;
const PROBE_INTERVAL_MS = 6_000;
const PROBE_TIMEOUT_MS = 5_000;

interface ConnectivityState {
  online: boolean;
  /** When we last heard from the server (ms epoch), or null. */
  lastOnlineAt: number | null;
}

export const useConnectivity = create<ConnectivityState>(() => ({
  online: true,
  lastOnlineAt: null,
}));

type OnlineListener = () => void;
const onlineListeners = new Set<OnlineListener>();

/** Run `fn` each time we transition from offline to online. */
export function onOnline(fn: OnlineListener) {
  onlineListeners.add(fn);
  return () => {
    onlineListeners.delete(fn);
  };
}

export const isOnline = () => useConnectivity.getState().online;

export function reportOnline() {
  const wasOffline = !useConnectivity.getState().online;
  useConnectivity.setState({ online: true, lastOnlineAt: Date.now() });
  if (wasOffline) {
    stopProbing();
    for (const l of onlineListeners) {
      try {
        l();
      } catch (e) {
        console.warn("[connectivity] listener failed", e);
      }
    }
  }
}

export function reportOffline() {
  if (useConnectivity.getState().online) {
    useConnectivity.setState({ online: false });
  }
  startProbing();
}

// --- probing -----------------------------------------------------------------
let probeTimer: ReturnType<typeof setInterval> | null = null;
let appStateSub: { remove: () => void } | null = null;

/** One reachability check right now. Resolves to the new online state. */
export async function checkNow(): Promise<boolean> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    const res = await fetch(HEALTH_URL, {
      method: "GET",
      signal: controller.signal,
    });
    if (res.ok) {
      reportOnline();
      return true;
    }
  } catch {
    /* unreachable */
  } finally {
    clearTimeout(t);
  }
  reportOffline();
  return false;
}

function startProbing() {
  if (probeTimer) return;
  probeTimer = setInterval(() => {
    if (AppState.currentState === "active") void checkNow();
  }, PROBE_INTERVAL_MS);
  // Also probe the moment the app comes back to the foreground.
  appStateSub = AppState.addEventListener("change", (state) => {
    if (state === "active" && !isOnline()) void checkNow();
  });
}

function stopProbing() {
  if (probeTimer) clearInterval(probeTimer);
  probeTimer = null;
  appStateSub?.remove();
  appStateSub = null;
}

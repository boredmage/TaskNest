import { reportOffline, reportOnline } from "@/lib/connectivity";
import * as SecureStore from "expo-secure-store";

/**
 * HTTP client for the TaskNest server (Hono). Owns the session (access +
 * refresh token), persists it in SecureStore, transparently refreshes the
 * access token, and surfaces server errors as `ApiError` with the server's
 * stable `code` (e.g. "invalid_credentials").
 */

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(
  /\/$/,
  ""
);

if (!API_URL) {
  console.warn(
    "[api] EXPO_PUBLIC_API_URL is not set. Add it to mobile/.env (use your machine's LAN IP for physical devices)."
  );
}

export type Session = {
  access_token: string;
  refresh_token: string;
  /** Unix seconds */
  expires_at: number;
  token_type: "bearer";
};

export type AuthUser = {
  id: string;
  email: string;
  created_at: string;
};

export type AuthResponse = { user: AuthUser; session: Session };

/** The request never reached the server (offline, DNS, timeout). */
export class NetworkError extends Error {
  constructor(message = "You're offline") {
    super(message);
    this.name = "NetworkError";
  }
}

export const isNetworkError = (err: unknown): err is NetworkError =>
  err instanceof NetworkError;

/** Give up on a request after this long; a hung socket is as good as offline. */
const REQUEST_TIMEOUT_MS = 15_000;

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ---------------------------------------------------------------------------
// Session persistence
// ---------------------------------------------------------------------------
const SESSION_KEY = "tasknest.session";

let currentSession: Session | null = null;
let currentUser: AuthUser | null = null;
let restored = false;
type Listener = (session: Session | null, user: AuthUser | null) => void;
const listeners = new Set<Listener>();

function emit() {
  for (const l of listeners) l(currentSession, currentUser);
}

export function onSessionChange(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSession() {
  return currentSession;
}

export function getUser() {
  return currentUser;
}

async function persist(session: Session | null, user: AuthUser | null) {
  currentSession = session;
  currentUser = user;
  try {
    if (session && user) {
      await SecureStore.setItemAsync(
        SESSION_KEY,
        JSON.stringify({ session, user })
      );
    } else {
      await SecureStore.deleteItemAsync(SESSION_KEY);
    }
  } catch (e) {
    console.warn("[api] failed to persist session", e);
  }
  emit();
}

/** Load the persisted session once at app start. */
export async function restoreSession() {
  if (restored) return { session: currentSession, user: currentUser };
  restored = true;
  try {
    const raw = await SecureStore.getItemAsync(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { session: Session; user: AuthUser };
      currentSession = parsed.session;
      currentUser = parsed.user;
    }
  } catch (e) {
    console.warn("[api] failed to restore session", e);
  }
  emit();
  return { session: currentSession, user: currentUser };
}

// ---------------------------------------------------------------------------
// Token refresh
// ---------------------------------------------------------------------------
let refreshing: Promise<Session | null> | null = null;

async function refreshSession(): Promise<Session | null> {
  if (refreshing) return refreshing;
  const refreshToken = currentSession?.refresh_token;
  if (!refreshToken) return null;

  refreshing = (async () => {
    try {
      const res = await fetch(`${API_URL}/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) {
        // Refresh token invalid/expired/reused: the session is dead.
        if (res.status === 401) await persist(null, null);
        return null;
      }
      const data = (await res.json()) as AuthResponse;
      await persist(data.session, data.user);
      return data.session;
    } catch (e) {
      // Network failure: keep the session; the next request will retry.
      console.warn("[api] refresh failed", e);
      return currentSession;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

/** Refresh if the access token expires within `withinSeconds`. */
export async function refreshIfNeeded(withinSeconds = 60) {
  if (!currentSession) return null;
  const now = Math.floor(Date.now() / 1000);
  if (currentSession.expires_at - now > withinSeconds) return currentSession;
  return refreshSession();
}

// ---------------------------------------------------------------------------
// Request helper
// ---------------------------------------------------------------------------
type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Send multipart instead of JSON. */
  formData?: FormData;
  /** Attach the bearer token (default true). */
  auth?: boolean;
  query?: Record<string, string | number | undefined>;
};

export async function request<T = unknown>(
  path: string,
  opts: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, formData, auth = true, query } = opts;

  const url = new URL(`${API_URL}/v1${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }

  const doFetch = async (retryOn401: boolean): Promise<T> => {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (auth) {
      const session = await refreshIfNeeded();
      if (session) headers.Authorization = `Bearer ${session.access_token}`;
    }
    let payload: BodyInit | undefined;
    if (formData) {
      payload = formData;
    } else if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      payload = JSON.stringify(body);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(url.toString(), {
        method,
        headers,
        body: payload,
        signal: controller.signal,
      });
    } catch (e) {
      // fetch only rejects for network-level failures.
      reportOffline();
      throw new NetworkError(
        e instanceof Error && e.name === "AbortError"
          ? "The server took too long to respond"
          : "You're offline"
      );
    } finally {
      clearTimeout(timeout);
    }
    reportOnline();

    if (res.status === 204) return undefined as T;

    const text = await res.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    if (!res.ok) {
      const err = json?.error ?? {};
      const code: string = err.code ?? `http_${res.status}`;

      if (
        res.status === 401 &&
        auth &&
        retryOn401 &&
        code === "token_expired"
      ) {
        const refreshed = await refreshSession();
        if (refreshed) return doFetch(false);
      }
      if (res.status === 401 && auth && code !== "invalid_credentials") {
        // Any other 401 on an authenticated call means our session is gone.
        await persist(null, null);
      }
      throw new ApiError(
        res.status,
        code,
        err.message ?? res.statusText ?? "Request failed",
        err.details
      );
    }
    return json as T;
  };

  return doFetch(true);
}

export const api = {
  get: <T>(path: string, query?: RequestOptions["query"]) =>
    request<T>(path, { method: "GET", query }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "DELETE", body }),
  upload: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: "POST", formData }),
};

// ---------------------------------------------------------------------------
// Auth endpoints (they manage the persisted session)
// ---------------------------------------------------------------------------
export const auth = {
  async signUp(email: string, password: string) {
    const data = await request<AuthResponse>("/auth/sign-up", {
      method: "POST",
      body: { email, password },
      auth: false,
    });
    await persist(data.session, data.user);
    return data;
  },

  async signIn(email: string, password: string) {
    const data = await request<AuthResponse>("/auth/sign-in", {
      method: "POST",
      body: { email, password },
      auth: false,
    });
    await persist(data.session, data.user);
    return data;
  },

  async signOut() {
    const refresh_token = currentSession?.refresh_token;
    try {
      if (refresh_token) {
        await request("/auth/sign-out", {
          method: "POST",
          body: { refresh_token },
        });
      }
    } catch (e) {
      // Local sign-out must always succeed.
      console.warn("[api] server sign-out failed", e);
    } finally {
      await persist(null, null);
    }
  },

  forgotPassword: (email: string) =>
    request<{ ok: true }>("/auth/password/forgot", {
      method: "POST",
      body: { email },
      auth: false,
    }),

  verifyResetCode: (email: string, code: string) =>
    request<{ reset_token: string }>("/auth/password/verify", {
      method: "POST",
      body: { email, code },
      auth: false,
    }),

  resetPassword: (reset_token: string, password: string) =>
    request<void>("/auth/password/reset", {
      method: "POST",
      body: { reset_token, password },
      auth: false,
    }),

  changePassword: (current_password: string, new_password: string) =>
    request<void>("/auth/password/change", {
      method: "POST",
      body: { current_password, new_password },
    }),
};

/** Extract a human-readable message from any thrown value. */
export function errorMessage(err: unknown, fallback = "Something went wrong") {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message || fallback;
  if (typeof err === "string") return err;
  return fallback;
}

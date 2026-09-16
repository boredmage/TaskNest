import { env } from "../env.ts";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export type PushMessage = {
  to: string;
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
  sound?: "default" | null;
  badge?: number;
  /** Android notification channel; must match the one the app creates. */
  channelId?: string;
  priority?: "default" | "normal" | "high";
};

type Ticket = { status: "ok"; id: string } | { status: "error"; message: string; details?: { error?: string } };

export function isExpoPushToken(token: string) {
  return /^(ExponentPushToken|ExpoPushToken)\[.+\]$/.test(token);
}

/**
 * Deliver to Expo's push service, chunked to 100 messages per request as
 * Expo requires. Errors are logged, never thrown, so a push failure can't
 * break the request that produced the notification.
 *
 * Returns the tokens Expo reported as no longer registered (the app was
 * uninstalled or notifications revoked) so the caller can prune them.
 */
export async function sendPush(messages: PushMessage[]): Promise<string[]> {
  const valid = messages.filter((m) => isExpoPushToken(m.to));
  if (valid.length === 0) return [];

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (env.EXPO_ACCESS_TOKEN) {
    headers.Authorization = `Bearer ${env.EXPO_ACCESS_TOKEN}`;
  }

  const dead: string[] = [];
  for (let i = 0; i < valid.length; i += 100) {
    const chunk = valid.slice(i, i + 100);
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(chunk),
      });
      if (!res.ok) {
        console.warn("[push] Expo responded", res.status, await res.text());
        continue;
      }
      const { data } = (await res.json()) as { data?: Ticket[] };
      data?.forEach((ticket, idx) => {
        if (ticket.status !== "error") return;
        const token = chunk[idx]!.to;
        if (ticket.details?.error === "DeviceNotRegistered") dead.push(token);
        else console.warn("[push] ticket error for", token.slice(0, 24) + "…", ticket.message);
      });
    } catch (err) {
      console.warn("[push] delivery failed", err);
    }
  }
  return dead;
}

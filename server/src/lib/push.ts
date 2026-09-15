import { env } from "../env.ts";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export type PushMessage = {
  to: string;
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
  sound?: "default" | null;
  badge?: number;
};

export function isExpoPushToken(token: string) {
  return /^(ExponentPushToken|ExpoPushToken)\[.+\]$/.test(token);
}

/**
 * Fire-and-forget delivery to Expo's push service. Chunks to 100 messages per
 * request as Expo requires. Errors are logged, never thrown, so a push failure
 * can't break the request that produced the notification.
 */
export async function sendPush(messages: PushMessage[]) {
  const valid = messages.filter((m) => isExpoPushToken(m.to));
  if (valid.length === 0) return;

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (env.EXPO_ACCESS_TOKEN) {
    headers.Authorization = `Bearer ${env.EXPO_ACCESS_TOKEN}`;
  }

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
      }
    } catch (err) {
      console.warn("[push] delivery failed", err);
    }
  }
}

import { api } from "@/lib/api";
import { sync } from "@/lib/sync";
import { useNotificationsStore } from "@/stores/notifications-store";
import { PN_TOKEN_STORAGE_KEY } from "@/utils/constants";
import { registerForPushNotificationsAsync } from "@/utils/registerForPushNotificationsAsync";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { AppState } from "react-native";

type PushData = {
  notification_id?: string;
  todo_id?: string;
  type?: string;
};

/**
 * Everything push-related that lives for the whole app session:
 *
 * - registers this device's Expo token with the API whenever a user is
 *   signed in (the PUT is idempotent, so this runs on every launch and
 *   picks up rotated tokens);
 * - opens the relevant screen when a push is tapped, including a tap that
 *   cold-started the app, deferring until the signed-in stack is mounted;
 * - clears the app icon badge whenever the app comes to the foreground.
 */
export function usePushNotifications(userId: string | null, ready: boolean) {
  // --- registration ---------------------------------------------------------
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const token = await registerForPushNotificationsAsync();
      if (!token || cancelled) return;
      try {
        await api.put("/push-tokens", { token, platform: "expo" });
        await AsyncStorage.setItem(PN_TOKEN_STORAGE_KEY, token);
      } catch (error) {
        console.warn("[push] failed to save push token", error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // --- taps -----------------------------------------------------------------
  const pending = useRef<PushData | null>(null);
  const readyRef = useRef(ready);
  readyRef.current = ready;

  const flush = useCallback(() => {
    const data = pending.current;
    if (!data || !readyRef.current) return;
    pending.current = null;
    openFromPush(data);
  }, []);

  useEffect(() => {
    // A tap that launched the app arrives before any listener is attached.
    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (!response) return;
        pending.current = response.notification.request.content
          .data as PushData;
        // So the same launch tap isn't replayed on the next cold start.
        Notifications.clearLastNotificationResponseAsync().catch(() => {});
        flush();
      })
      .catch(() => {});

    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        pending.current = response.notification.request.content
          .data as PushData;
        flush();
      }
    );
    // A push arriving while the app is open means the server has news for
    // us: catch up right away (and send anything queued offline).
    const received = Notifications.addNotificationReceivedListener(() => {
      void sync("push");
    });
    return () => {
      sub.remove();
      received.remove();
    };
  }, [flush]);

  useEffect(() => {
    if (ready) flush();
  }, [ready, flush]);

  // --- badge ----------------------------------------------------------------
  useEffect(() => {
    const clear = () => Notifications.setBadgeCountAsync(0).catch(() => {});
    clear();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") clear();
    });
    return () => sub.remove();
  }, []);
}

/** Navigate for a tapped push and mark its notification read. */
function openFromPush(data: PushData) {
  void sync("push-tap");
  if (data.notification_id) {
    useNotificationsStore
      .getState()
      .patchNotificationData(data.notification_id, {})
      .catch(() => {});
  }
  if (data.todo_id) {
    router.push({ pathname: "/task/[id]", params: { id: data.todo_id } });
  } else {
    router.navigate("/(tabs)/news");
  }
}

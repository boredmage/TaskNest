import { SignInSuccess } from "@/components/auth/sign-in-success";
import { Splash } from "@/components/splash";
import { AppThemeProvider } from "@/contexts/app-theme-context";
import "@/i18n";
import i18n from "@/i18n";
import { api, refreshIfNeeded } from "@/lib/api";
import { startRealtime, stopRealtime } from "@/lib/realtime";
import { useAuthStore } from "@/stores/auth-store";
import { useNotificationsStore } from "@/stores/notifications-store";
import { PN_REGISTERED_STORAGE_KEY } from "@/utils/constants";
import { registerForPushNotificationsAsync } from "@/utils/registerForPushNotificationsAsync";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { HeroUINativeProvider } from "heroui-native";
import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  KeyboardAvoidingView,
  KeyboardProvider,
} from "react-native-keyboard-controller";
import "../../global.css";
import { useFamilyStore } from "../stores/family-store";
import { useProfileStore } from "../stores/profile-store";
import { useTodosStore } from "../stores/todos-store";

SplashScreen.setOptions({
  fade: true,
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Refresh the access token when the app returns to the foreground so the
// first request after a long background doesn't pay a 401 round-trip.
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    refreshIfNeeded().catch(() => {});
  }
});

async function savePushTokenForUser(token: string) {
  try {
    await api.put("/push-tokens", { token, platform: "expo" });
  } catch (error) {
    console.error("Failed to save push token", error);
  }
}

const AppContent = () => {
  const { session, user, initialized, celebrating, restore } = useAuthStore();
  // Keep the branded splash up for at least a beat so it never flashes.
  const [splashMinElapsed, setSplashMinElapsed] = useState(false);
  const profileReady = useProfileStore((s) => s.initialized);
  // Stay on the splash until we know whether to show the tabs or the
  // "complete your profile" screen, so the app never lands on the wrong one.
  const loading =
    !initialized ||
    !splashMinElapsed ||
    (session !== null && !celebrating && !profileReady);
  // The sign-in success dialog plays over the auth screens before they swap out.
  const signedIn = session !== null && !celebrating && profileReady;
  // Keep the dialog on screen a beat longer than the swap so the auth stack's
  // dismissal never shows through.
  const [showSuccess, setShowSuccess] = useState(false);
  useEffect(() => {
    if (celebrating) {
      setShowSuccess(true);
      return;
    }
    const timer = setTimeout(() => setShowSuccess(false), 500);
    return () => clearTimeout(timer);
  }, [celebrating]);
  const userId = user?.id ?? null;
  const { fetchProfile, clearProfile } = useProfileStore();
  const { fetchFamily, clearFamily } = useFamilyStore();
  const { fetchTodos, clear: clearTodos } = useTodosStore();
  const { fetchNotifications, clear: clearNotifications } =
    useNotificationsStore();

  const contentWrapper = useCallback(
    (children: React.ReactNode) => (
      <KeyboardAvoidingView
        pointerEvents="box-none"
        behavior="padding"
        keyboardVerticalOffset={12}
        className="flex-1"
      >
        {children}
      </KeyboardAvoidingView>
    ),
    []
  );

  // Load the persisted session once at startup.
  useEffect(() => {
    restore();
    const timer = setTimeout(() => setSplashMinElapsed(true), 900);
    return () => clearTimeout(timer);
  }, []);

  // React to sign-in / sign-out (including the API client dropping a dead
  // session after a failed refresh).
  useEffect(() => {
    if (!initialized) return;

    if (userId) {
      fetchProfile();
      fetchFamily();
      fetchTodos();
      fetchNotifications();
      startRealtime();

      (async () => {
        try {
          const alreadyRegistered = await AsyncStorage.getItem(
            PN_REGISTERED_STORAGE_KEY
          );
          if (!alreadyRegistered) {
            const token = await registerForPushNotificationsAsync();
            if (token) {
              await savePushTokenForUser(token);
              await AsyncStorage.setItem(PN_REGISTERED_STORAGE_KEY, "true");
            }
          }
        } catch (e) {
          console.warn("Push notification registration failed", e);
        }
      })();
    } else {
      stopRealtime();
      clearProfile();
      clearFamily();
      clearTodos();
      clearNotifications();
    }
  }, [initialized, userId]);

  return (
    <AppThemeProvider>
      <HeroUINativeProvider
        config={{
          toast: {
            contentWrapper,
          },
          devInfo: {
            stylingPrinciples: false,
          },
        }}
      >
        <Stack>
          <Stack.Protected guard={!loading && !signedIn}>
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
          </Stack.Protected>
          <Stack.Protected guard={!loading && signedIn}>
            <Stack.Screen name="(protected)" options={{ headerShown: false }} />
          </Stack.Protected>
        </Stack>
        {showSuccess ? <SignInSuccess /> : null}
        {loading ? <Splash /> : null}
      </HeroUINativeProvider>
      <StatusBar style="auto" />
    </AppThemeProvider>
  );
};

export default function Layout() {
  useEffect(() => {
    (async () => {
      const savedLang = await AsyncStorage.getItem("language");
      if (savedLang) {
        await i18n.changeLanguage(savedLang);
      }
    })();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <AppContent />
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

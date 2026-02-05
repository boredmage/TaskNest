import { AppThemeProvider } from "@/contexts/app-theme-context";
import "@/i18n";
import i18n from "@/i18n";
import { supabase } from "@/lib/supabase";
import { registerForPushNotificationsAsync } from "@/utils/registerForPushNotificationsAsync";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session } from "@supabase/supabase-js";
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

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

async function savePushTokenForUser(userId: string, token: string) {
  const { error } = await supabase.from("user_push_tokens").upsert(
    {
      user_id: userId,
      token,
      platform: "expo",
    },
    { onConflict: "user_id,token" }
  );

  if (error) {
    console.error("Failed to save push token", error);
  }
}

const AppContent = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { fetchProfile, clearProfile } = useProfileStore();
  const { fetchFamily, clearFamily } = useFamilyStore();

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

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session) {
        fetchProfile();
        fetchFamily();
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);

      if (
        (event === "INITIAL_SESSION" || event === "SIGNED_IN") &&
        session !== null
      ) {
        if (session.user) {
          try {
            const token = await registerForPushNotificationsAsync();
            if (token) {
              await savePushTokenForUser(session.user.id, token);
            }
          } catch (e) {
            console.warn("Push notification registration failed", e);
          }
        }
      }

      if (session !== null) {
        setLoading(false);
        fetchProfile();
        fetchFamily();
      } else {
        clearProfile();
        clearFamily();
      }
    });

    // Cleanup subscription
    return () => subscription.unsubscribe();
  }, []);

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
          <Stack.Protected guard={!loading && session === null}>
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
          </Stack.Protected>
          <Stack.Protected guard={!loading && session !== null}>
            <Stack.Screen name="(protected)" options={{ headerShown: false }} />
          </Stack.Protected>
        </Stack>
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

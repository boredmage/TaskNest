import { OfflineBanner } from "@/components/offline-banner";
import { useProfileStore } from "@/stores/profile-store";
import { Stack } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function ProtectedLayout() {
  const { profile, gateDismissed } = useProfileStore();
  // A new account lands on "complete your profile" instead of the tabs, once.
  const needsProfile =
    !!profile && !profile.full_name?.trim() && !gateDismissed;

  return (
    <View style={{ flex: 1 }}>
      <OfflineBanner />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Protected guard={!needsProfile}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="todo" options={{ headerShown: false }} />
          <Stack.Screen name="completed" options={{ headerShown: false }} />
          <Stack.Screen name="overdue" options={{ headerShown: false }} />
          <Stack.Screen name="archive" options={{ headerShown: false }} />
          <Stack.Screen name="task/[id]" options={{ headerShown: false }} />
          <Stack.Screen
            name="new-task"
            options={{
              headerShown: false,
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Screen name="update-profile" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}

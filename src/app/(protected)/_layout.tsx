import { Stack } from "expo-router";
import React from "react";

export default function ProtectedLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="todo" options={{ headerShown: false }} />
      <Stack.Screen name="completed" options={{ headerShown: false }} />
      <Stack.Screen name="overdue" options={{ headerShown: false }} />
      <Stack.Screen name="archive" options={{ headerShown: false }} />
      <Stack.Screen
        name="new-task"
        options={{
          headerShown: false,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="*" />
    </Stack>
  );
}

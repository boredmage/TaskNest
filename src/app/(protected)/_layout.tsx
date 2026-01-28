import React from "react";
import { Slot, Stack } from "expo-router";

export default function ProtectedLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="todo" options={{ headerShown: false }} />
      <Stack.Screen name="completed" options={{ headerShown: false }} />
      <Stack.Screen name="overdue" options={{ headerShown: false }} />
      <Stack.Screen name="archive" options={{ headerShown: false }} />
      <Stack.Screen name="new-task" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="*" />
    </Stack>
  );
}

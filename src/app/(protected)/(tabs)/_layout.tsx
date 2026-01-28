import React from "react";
import { Tabs } from "expo-router";
import { View, Text } from "react-native";
import TabBar from "@/components/tab-bar";

function TabLabel({ label }: { label: string }) {
  return (
    <View className="items-center">
      <Text className="text-xs">{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Family",
          tabBarLabel: () => <TabLabel label="Family" />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarLabel: () => <TabLabel label="Tasks" />,
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: "News",
          tabBarLabel: () => <TabLabel label="News" />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarLabel: () => <TabLabel label="Settings" />,
        }}
      />
    </Tabs>
  );
}

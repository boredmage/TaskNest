import TabBar from "@/components/tab-bar";
import { Tabs } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

function TabLabel({ label }: { label: string }) {
  return (
    <View className="items-center">
      <Text className="text-xs">{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();

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
          title: t("tabs.family"),
          tabBarLabel: () => <TabLabel label="Family" />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: t("tabs.tasks"),
          tabBarLabel: () => <TabLabel label="Tasks" />,
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: t("tabs.activity"),
          tabBarLabel: () => <TabLabel label="News" />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("tabs.settings"),
          tabBarLabel: () => <TabLabel label="Settings" />,
        }}
      />
    </Tabs>
  );
}

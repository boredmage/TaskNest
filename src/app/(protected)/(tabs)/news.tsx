import SettingsOutline from "@/components/icons/settings-outline";
import YellowBell from "@/components/icons/yello-bell";
import Notification from "@/components/notifications";
import { useAppTheme } from "@/contexts/app-theme-context";
import { useNotificationsStore } from "@/stores/notifications-store";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const News = () => {
  const { t } = useTranslation();
  const { isDark } = useAppTheme();
  const router = useRouter();
  const { fetchNotifications, notifications, loading } =
    useNotificationsStore();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDark ? "#222222" : "#F2F2F2",
      }}
    >
      <View className="flex-1 gap-4 px-4">
        {/* <Text className="text-text-day dark:text-text-night my-2 self-center text-2xl font-semibold">
          {t("tabs.activity")}
        </Text> */}

        <View className="my-2 flex-row items-center justify-between">
          <View className="flex-1"></View>
          <View className="grow">
            <Text className="text-text-day dark:text-text-night self-center text-2xl font-semibold">
              {t("tabs.activity")}
            </Text>
          </View>
          <View className="flex-1 items-end">
            <TouchableOpacity
              onPress={() => router.push("/settings/notifications")}
              activeOpacity={0.8}
              hitSlop={10}
            >
              <SettingsOutline width={24} height={24} />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Notification key={item.id} notification={item} />
          )}
          contentContainerClassName="gap-4 pb-20 grow"
          refreshing={loading}
          onRefresh={fetchNotifications}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center gap-2.5 pb-20">
              <YellowBell width={46} height={46} />
              <Text className="text-text-day dark:text-text-night text-2xl font-semibold">
                No Notifications Yet
              </Text>
              <Text className="text-hint ios:leading-0 max-w-xs text-center text-base">
                You don&apos;t have any notifications right now. When you do,
                they&apos;ll show up here.
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

export default News;

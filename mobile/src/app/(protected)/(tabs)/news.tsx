import { EmptyState } from "@/components/empty-state";
import { TabHeader } from "@/components/header";
import SettingsOutline from "@/components/icons/settings-outline";
import YellowBell from "@/components/icons/yello-bell";
import Notification from "@/components/notifications";
import { RefreshableFlatList } from "@/components/refreshable-flat-list";
import { useAppTheme } from "@/contexts/app-theme-context";
import { formatDayHeading } from "@/lib/dates";
import {
  useNotificationsStore,
  type AppNotification,
} from "@/stores/notifications-store";
import { useRouter } from "expo-router";
import { cn } from "heroui-native";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Row =
  | { kind: "heading"; key: string; label: string; count: number }
  | { kind: "item"; key: string; notification: AppNotification };

/** Group by calendar day so the list reads "Today · 2", "Yesterday · 1", ... */
function groupByDay(notifications: AppNotification[]): Row[] {
  const rows: Row[] = [];
  let currentDay: string | null = null;
  let heading: Extract<Row, { kind: "heading" }> | null = null;

  for (const n of notifications) {
    const day = new Date(n.created_at).toDateString();
    if (day !== currentDay) {
      currentDay = day;
      heading = {
        kind: "heading",
        key: `h-${day}`,
        label: formatDayHeading(n.created_at),
        count: 0,
      };
      rows.push(heading);
    }
    heading!.count += 1;
    rows.push({ kind: "item", key: n.id, notification: n });
  }
  return rows;
}

/** News tab (Figma 205:6224, empty 205:6217). */
const News = () => {
  const { t } = useTranslation();
  const { isDark } = useAppTheme();
  const router = useRouter();
  const { fetchNotifications, notifications, loading } =
    useNotificationsStore();
  const rows = useMemo(() => groupByDay(notifications), [notifications]);

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: isDark ? "#222222" : "#F2F2F2" }}
    >
      <TabHeader
        title={t("tabs.activity")}
        right={<SettingsOutline width={28} height={28} />}
        onRightPress={() => router.push("/settings/notifications")}
      />
      <View className="flex-1 px-4">
        <RefreshableFlatList
          data={rows}
          keyExtractor={(row) => row.key}
          renderItem={({ item, index }) =>
            item.kind === "heading" ? (
              <View
                className={cn(
                  "ml-1 flex-row items-baseline gap-1.5 pb-2",
                  index > 0 && "pt-4"
                )}
              >
                <Text className="text-text-day dark:text-text-night text-sm font-semibold">
                  {item.label}
                </Text>
                <Text className="text-hint text-xs">{item.count}</Text>
              </View>
            ) : (
              <View className="pb-2">
                <Notification notification={item.notification} />
              </View>
            )
          }
          contentContainerClassName="grow pt-2 pb-32"
          refreshing={loading}
          onRefresh={fetchNotifications}
          ListEmptyComponent={
            <View className="mb-24 flex-1">
              <EmptyState
                illustration={<YellowBell width={46} height={46} />}
                title="No Notifications Yet"
                body="You don't have any notifications right now. When you do, they'll show up here."
              />
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

export default News;

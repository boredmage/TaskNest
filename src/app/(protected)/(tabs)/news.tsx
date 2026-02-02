import YellowBell from "@/components/icons/yello-bell";
import { useAppTheme } from "@/contexts/app-theme-context";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const News = () => {
  const { t } = useTranslation();
  const { isDark } = useAppTheme();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDark ? "#222222" : "#F2F2F2",
      }}
    >
      <View className="flex-1 gap-4 px-4">
        <Text className="text-text-day dark:text-text-night my-2 self-center text-2xl font-semibold">
          {t("tabs.news")}
        </Text>

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
      </View>
    </SafeAreaView>
  );
};

export default News;

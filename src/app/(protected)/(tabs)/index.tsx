import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { TriggerNewFamilyBottomSheet } from "@/components/bottom-sheet/trigger-new-family-bottom-sheet";
import { useAppTheme } from "@/contexts/app-theme-context";

const Family = () => {
  const { t } = useTranslation();
  const { isDark } = useAppTheme();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDark ? "#222222" : "#F2F2F2",
      }}
    >
      <View className="flex-1 px-4 gap-4">
        <Text className="text-2xl font-semibold text-text-day dark:text-text-night self-center">
          {t("tabs.family")}
        </Text>

        <View className="flex-1 items-center justify-center gap-2.5 pb-20">
          <Text className="text-2xl font-semibold text-text-day dark:text-text-night">
            🏡 No Family Yet
          </Text>
          <Text className="text-center max-w-72 text-hint text-base">
            To get started, create your own or join an existing one using a
            family code.
          </Text>

          <TriggerNewFamilyBottomSheet />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Family;

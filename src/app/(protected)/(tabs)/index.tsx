import { TriggerNewFamilyBottomSheet } from "@/components/bottom-sheet/trigger-new-family-bottom-sheet";
import { useAppTheme } from "@/contexts/app-theme-context";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
      <View className="flex-1 gap-4 px-4">
        <Text className="text-text-day dark:text-text-night self-center text-2xl font-semibold">
          {t("tabs.family")}
        </Text>

        <View className="flex-1 items-center justify-center gap-2.5 pb-20">
          <Text className="text-text-day dark:text-text-night text-2xl font-semibold">
            🏡 No Family Yet
          </Text>
          <Text className="text-hint max-w-72 text-center text-base">
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

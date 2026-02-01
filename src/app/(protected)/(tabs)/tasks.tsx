import { CustomButton } from "@/components/custom-button";
import StatsCard from "@/components/stats-card";
import { useAppTheme } from "@/contexts/app-theme-context";
import { StatusEnum as Status } from "@/type";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Tasks = () => {
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
          {t("tabs.tasks")}
        </Text>

        <View className="gap-2">
          <View className="flex-row gap-2">
            <StatsCard type={Status.TODO} value={10} />
            <StatsCard type={Status.COMPLETED} value={4} />
          </View>
          <View className="flex-row gap-2">
            <StatsCard type={Status.OVERDUE} value={4} />
            <StatsCard type={Status.ARCHIVED} value={0} />
          </View>
        </View>

        <View className="flex-1 items-center justify-center gap-2.5 pb-20">
          <Text className="text-text-day dark:text-text-night text-2xl font-semibold">
            No Tasks Yet
          </Text>
          <Text className="text-hint max-w-72 text-center text-base">
            You don’t have any tasks right now. Create a new one to get started!
          </Text>
          <Link href="/new-task" asChild>
            <CustomButton size="sm" className="px-6">
              Create
            </CustomButton>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Tasks;

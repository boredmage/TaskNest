import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { Link } from "expo-router";
import { CustomButton } from '@/components/custom-button';
import { SafeAreaView } from "react-native-safe-area-context";
import StatsCard from "@/components/stats-card";
import { StatusEnum as Status } from "@/type";
import { useTranslation } from "react-i18next";

const Tasks = () => {
  const { t } = useTranslation();

  return (
    <SafeAreaView
      style={{ flex: 1 }}
    >
      <View className="flex-1 px-4 gap-4">
        <Text className="text-2xl font-semibold text-text-day self-center">{t("tabs.tasks")}</Text>

        <View className="gap-2">
          <View className="flex-row gap-2">
            <StatsCard type={Status.TODO} value={0} />
            <StatsCard type={Status.COMPLETED} value={0} />
          </View>
          <View className="flex-row gap-2">
            <StatsCard type={Status.OVERDUE} value={0} />
            <StatsCard type={Status.ARCHIVED} value={0} />
          </View>
        </View>


        <View className='flex-1 items-center justify-center gap-2.5 pb-20'>
          <Text className='text-2xl font-semibold text-text-day leading-0'>No Tasks Yet</Text>
          <Text className='text-center max-w-72 text-hint-day text-base leading-0'>You don’t have any tasks right now. Create a new one to get started!</Text>
          <Link href="/new-task" asChild>
            <CustomButton size='sm' className='px-6'>
              Create
            </CustomButton>
          </Link>
        </View>


        {/* <CustomButton onPress={() => router.push('/onboarding')}>
          Go to Onboarding
        </CustomButton> */}
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

export default Tasks;

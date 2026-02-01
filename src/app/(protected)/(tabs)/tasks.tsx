import { Text, View } from 'react-native';
import { Link } from 'expo-router';
import { CustomButton } from '@/components/custom-button';
import { SafeAreaView } from 'react-native-safe-area-context';
import StatsCard from '@/components/stats-card';
import { StatusEnum as Status } from '@/type';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/contexts/app-theme-context';

const Tasks = () => {
  const { t } = useTranslation();
  const { isDark } = useAppTheme();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDark ? '#222222' : '#F2F2F2',
      }}
    >
      <View className="flex-1 px-4 gap-4">
        <Text className="text-2xl my-2 font-semibold text-text-day dark:text-text-night self-center">
          {t('tabs.tasks')}
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
          <Text className="text-2xl font-semibold text-text-day dark:text-text-night">
            No Tasks Yet
          </Text>
          <Text className="text-center max-w-72 text-hint text-base">
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

import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { CustomButton } from '@/components/custom-button';
import { SafeAreaView } from "react-native-safe-area-context";
import StatsCard from "@/components/stats-card";
import { StatusEnum as Status } from "@/type";

export default function App() {
  const router = useRouter();

  return (
    <SafeAreaView
      style={{ flex: 1 }}
    >
      <View className="flex-1 px-4 gap-4">
        <Text className="text-2xl font-semibold text-text-day self-center">Tasks</Text>

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

        <CustomButton onPress={() => router.push('/onboarding')}>
          Go to Onboarding
        </CustomButton>
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

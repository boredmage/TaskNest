import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { CustomButton } from '../components/custom-button';

export default function App() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-primary items-center justify-center p-4">
      <Text className="text-2xl font-bold text-white mb-8">Hello World</Text>
      <CustomButton onPress={() => router.push('/onboarding')}>
        Go to Onboarding
      </CustomButton>
      <StatusBar style="light" />
    </View>
  );
}

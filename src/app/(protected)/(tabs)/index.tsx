import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { CustomButton } from '@/components/custom-button';
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

const Family = () => {
  const { t } = useTranslation();
  
  return (
    <SafeAreaView
      style={{ flex: 1 }}
    >
      <View className="flex-1 px-4 gap-4">
        <Text className="text-2xl font-semibold text-text-day self-center">{t("tabs.family")}</Text>


        <View className='flex-1 items-center justify-center gap-2.5 pb-20'>
          <Text className='text-2xl font-semibold text-text-day leading-0'>🏡 No Family Yet</Text>
          <Text className='text-center max-w-72 text-hint-day text-base leading-0'>To get started, create your own or join an existing one using a family code.</Text>

          <CustomButton size='sm' className='px-6'>
            Start
          </CustomButton>

        </View>
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

export default Family;
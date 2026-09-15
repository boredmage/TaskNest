import Arrow from "@/components/icons/arrow";
import { useAppTheme } from "@/contexts/app-theme-context";
import { Slot, useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthLayout() {
  const router = useRouter();
  const { isDark } = useAppTheme();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/onboarding");
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#222222" : "#F2F2F2" }}
    >
      <View className="flex-1 px-4">
        <TouchableOpacity onPress={handleBack} className="py-4" hitSlop={10}>
          <Arrow
            stroke={isDark ? "#FFFFFF" : "#1B1B1B"}
            width={30}
            height={30}
          />
        </TouchableOpacity>
        <View className="flex-1 pt-28">
          <Slot />
        </View>
      </View>
    </SafeAreaView>
  );
}

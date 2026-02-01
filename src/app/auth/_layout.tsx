import Arrow from "@/components/icons/arrow";
import { Slot, useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthLayout() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 px-4">
        <TouchableOpacity onPress={handleBack} className="py-4" hitSlop={10}>
          <Arrow />
        </TouchableOpacity>
        <View className="flex-1 pt-28">
          <Slot />
        </View>
      </View>
    </SafeAreaView>
  );
}

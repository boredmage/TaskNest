import { useAppTheme } from "@/contexts/app-theme-context";
import { useLocalSearchParams, useRouter, useSegments } from "expo-router";
import { cn } from "heroui-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Arrow from "../components/icons/arrow";

export default function WithArrowBack({
  children,
  title,
  className,
}: {
  children: React.ReactNode;
  title?: string;
  className?: string;
}) {
  const router = useRouter();
  const segments = useSegments();
  const params = useLocalSearchParams();
  const { isDark } = useAppTheme();
  const handleBack = () => {
    const fromDeepLink = params.fromDeepLink === "true";
    const isAtRoot = segments.length <= 1;

    if (fromDeepLink || isAtRoot) {
      router.replace("/(tabs)");
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDark ? "#222222" : "#F2F2F2",
      }}
    >
      <View className={cn("flex-1 px-4", className)}>
        <View className="flex-row py-2!">
          <View className="flex-1">
            <TouchableOpacity
              className="flex-1 justify-center"
              onPress={handleBack}
            >
              <Arrow
                stroke={isDark ? "#FFFFFF" : "#1B1B1B"}
                width={30}
                height={30}
              />
            </TouchableOpacity>
          </View>
          <View className="flex-1">
            <Text className="text-text-day dark:text-text-night text-center text-xl font-semibold">
              {title}
            </Text>
          </View>
          <View className="flex-1"></View>
        </View>
        {children}
      </View>
    </SafeAreaView>
  );
}

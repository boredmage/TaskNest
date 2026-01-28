import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Arrow from '../components/icons/arrow';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useSegments } from 'expo-router';
import { cn } from 'heroui-native';

export default function WithArrowBack({
  children,
  title,
  className
}: {
  children: React.ReactNode;
  title?: string;
  className?: string;
}) {
  const router = useRouter();
  const segments = useSegments();
  const params = useLocalSearchParams();

  const handleBack = () => {
    const fromDeepLink = params.fromDeepLink === 'true';
    const isAtRoot = segments.length <= 1;

    if (fromDeepLink || isAtRoot) {
      router.replace('/(tabs)');
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: '#F2F2F2',
    }}>
      <View className={cn('flex-1 px-4', className)}>
        <View className="flex-row">
          <View className="flex-1">
            <TouchableOpacity className="justify-center flex-1" onPress={handleBack}>
              <Arrow color="black" width={30} height={30} />
            </TouchableOpacity>
          </View>
          <View className="flex-1">
            <Text className="text-xl font-semibold text-center">
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
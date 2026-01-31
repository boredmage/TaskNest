import { View, Text, useColorScheme } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import YellowBell from '@/components/icons/yello-bell'
import { useTranslation } from "react-i18next";

const News = () => {
  const { t } = useTranslation();
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: isDarkMode ? '#222222' : '#F2F2F2',
    }}>
      <View className="flex-1 px-4 gap-4">
        <Text className="text-2xl font-semibold text-text-day dark:text-text-night self-center">{t("tabs.news")}</Text>

        <View className='flex-1 items-center justify-center gap-2.5 pb-20'>

          <YellowBell width={46} height={46} />

          <Text className='text-2xl font-semibold text-text-day dark:text-text-night'>No Notifications Yet</Text>
          <Text className='text-center max-w-xs text-hint text-base ios:leading-0'>You don&apos;t have any notifications right now. When you do, they&apos;ll show up here.</Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default News
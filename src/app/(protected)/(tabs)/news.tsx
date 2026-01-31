import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import YellowBell from '@/components/icons/yello-bell'
import { useTranslation } from "react-i18next";

const News = () => {
  const { t } = useTranslation();

  return (
    <SafeAreaView
      style={{ flex: 1 }}
    >
      <View className="flex-1 px-4 gap-4">
        <Text className="text-2xl font-semibold text-text-day self-center">{t("tabs.news")}</Text>

        <View className='flex-1 items-center justify-center gap-2.5 pb-20'>

          <YellowBell width={46} height={46} />

          <Text className='text-2xl font-semibold text-text-day'>No Notifications Yet</Text>
          <Text className='text-center max-w-xs text-hint-day text-base leading-0'>You don’t have any notifications right now. When you do, they’ll show up here.</Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default News
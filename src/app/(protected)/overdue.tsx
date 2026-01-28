import { View, Text } from 'react-native'
import React from 'react'
import WithArrowBack from '@/layout/with-arrow-back'
import ClockIcon from '@/components/icons/clock-icon'

const Overdue = () => {
  return (
    <WithArrowBack title="Overdue">
      <View className='flex-1 items-center justify-center gap-2.5'>
        <View className='bg-[#FF5050] rounded-lg p-2 items-center justify-center size-10'>
          <ClockIcon width={20} height={20} />
        </View>
        <Text className='text-2xl font-semibold text-text-day'>Nothing&apos;s Overdue</Text>
        <Text className='text-center max-w-64 text-hint-day text-base leading-0'>Great job! You have no overdue tasks at the moment.</Text>
      </View>
    </WithArrowBack>
  )
}

export default Overdue
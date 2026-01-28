import { View, Text } from 'react-native'
import React from 'react'

import { StatusEnum as Status } from '@/type'
import FileIcon from './icons/file-icon'
import TrophyIcon from './icons/trophy-icon'
import ClockIcon from './icons/clock-icon'
import ArchiveIcon from './icons/archive-icon'
import { SvgProps } from 'react-native-svg'

const statusIconMap: Record<Status, {
  icon: React.FC<SvgProps>,
  backgroundColor: string,
  title: string,
}> = {
  [Status.TODO]: {
    icon: FileIcon,
    backgroundColor: '#A06CFF',
    title: 'Tasks',
  },
  [Status.COMPLETED]: {
    icon: TrophyIcon,
    backgroundColor: '#72D000',
    title: 'Completed',
  },
  [Status.OVERDUE]: {
    icon: ClockIcon,
    backgroundColor: '#FF5050',
    title: 'Overdue',
  },
  [Status.ARCHIVED]: {
    icon: ArchiveIcon,
    backgroundColor: '#00000033',
    title: 'Archived',
  },
}

const StatsCard = ({ type, value }: { type: Status, value: number }) => {
  const Icon = statusIconMap[type].icon;

  return (
    <View className='bg-white rounded-xl p-4 flex-1 gap-4'>
      <View className='flex-row items-start justify-between gap-2'>
        <View className='rounded-lg p-2'
          style={{ backgroundColor: statusIconMap[type].backgroundColor }}
        >
          <Icon />
        </View>
        <Text className='text-text-day text-2xl font-medium'>{value}</Text>
      </View>
      <Text className='text-text-day text-base font-medium'>{statusIconMap[type].title}</Text>
    </View>
  )
}

export default StatsCard
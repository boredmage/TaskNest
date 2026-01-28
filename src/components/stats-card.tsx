import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

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
  route: string,
}> = {
  [Status.TODO]: {
    icon: FileIcon,
    backgroundColor: '#A06CFF',
    title: 'Tasks',
    route: 'todo',
  },
  [Status.COMPLETED]: {
    icon: TrophyIcon,
    backgroundColor: '#72D000',
    title: 'Completed',
    route: 'completed',
  },
  [Status.OVERDUE]: {
    icon: ClockIcon,
    backgroundColor: '#FF5050',
    title: 'Overdue',
    route: 'overdue',
  },
  [Status.ARCHIVED]: {
    icon: ArchiveIcon,
    backgroundColor: '#00000033',
    title: 'Archived',
    route: 'archive',
  },
}

const StatsCard = ({ type, value }: { type: Status, value: number }) => {
  const Icon = statusIconMap[type].icon;

  return (
    <Link href={`/${statusIconMap[type].route}`} asChild>
      <TouchableOpacity activeOpacity={0.85} className='bg-white rounded-xl p-4 flex-1 gap-4'>
        <View className='flex-row items-start justify-between gap-2'>
          <View
            className='rounded-lg p-2'
            style={{ backgroundColor: statusIconMap[type].backgroundColor }}
          >
            <Icon />
          </View>
          <Text className='text-text-day text-2xl font-medium'>{value}</Text>
        </View>
        <Text className='text-text-day text-base font-medium'>
          {statusIconMap[type].title}
        </Text>
      </TouchableOpacity>
    </Link>
  )
}

export default StatsCard
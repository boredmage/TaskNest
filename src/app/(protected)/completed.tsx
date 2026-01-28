import { CustomButton } from '@/components/custom-button'
import FileIcon from '@/components/icons/file-icon'
import TrophyIcon from '@/components/icons/trophy-icon'
import WithArrowBack from '@/layout/with-arrow-back'

import { View, Text } from 'react-native'

const Completed = () => {
  return (
    <WithArrowBack title="Completed">
      <View className='flex-1 items-center justify-center gap-2.5'>
        <View className='bg-[#72D000] rounded-lg p-2 items-center justify-center size-10'>
          <TrophyIcon width={20} height={20} />
        </View>
        <Text className='text-2xl font-semibold text-text-day'>No Completed Tasks</Text>
        <Text className='text-center max-w-xs text-hint-day text-base leading-0'>You haven’t completed any tasks yet. Keep going—completed tasks will show up here.</Text>
      </View>
    </WithArrowBack>
  )
}

export default Completed
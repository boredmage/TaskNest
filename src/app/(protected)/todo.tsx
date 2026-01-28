import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import WithArrowBack from '@/layout/with-arrow-back'
import { CustomButton } from '@/components/custom-button'
import { Link, useRouter } from 'expo-router'
import FileIcon from '@/components/icons/file-icon'

const Todos = () => {
  const router = useRouter();

  return (
    <WithArrowBack title="To Do">
      <View className='flex-1 items-center justify-center gap-2.5'>
        <View className='bg-[#A06CFF] rounded-lg p-2 items-center justify-center size-10'>
          <FileIcon />
        </View>
        <Text className='text-2xl font-semibold text-text-day'>No Tasks Yet</Text>
        <Text className='text-center max-w-60 text-hint-day text-base leading-0'>Start by adding a new task. Once you do, it will appear here.</Text>
        <Link href="/new-task" asChild>
          <CustomButton size='sm' className='px-6'>
            Create
          </CustomButton>
        </Link>
      </View>
    </WithArrowBack>
  )
}

export default Todos
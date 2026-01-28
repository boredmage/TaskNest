import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button } from 'heroui-native'
import { useRouter } from 'expo-router'

const Settings = () => {
  const router = useRouter();

  return (
    <SafeAreaView
      style={{ flex: 1 }}
    >
      <View className="flex-1 px-4 gap-4">
        <Text className="text-2xl font-semibold text-text-day self-center">Settings</Text>

        <Button variant='danger-soft' className='rounded-xl' onPress={() => router.push('/onboarding')}>
          Logout
        </Button>
      </View>
    </SafeAreaView>
  )
}

export default Settings
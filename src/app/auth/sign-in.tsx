import { View, Text, Pressable, TouchableOpacity } from 'react-native'
import React from 'react'
import { TextField } from 'heroui-native'
import { useState } from 'react';
import Eye from '@/components/icons/eye';
import EyeSlash from '@/components/icons/eye-slash';
import { CustomButton } from '@/components/custom-button';
import { Link } from 'expo-router';


const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View className='flex-1'>
      <View className='mb-6'>
        <Text className='text-2xl font-semibold'>Sign in</Text>
        <Text className='text-base text-hint'>Enter your email & password to sign in.</Text>
      </View>

      <View className="gap-4">
        <TextField isRequired>
          <TextField.Input
            placeholder="Email Address"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            className="rounded-xl bg-transparent-day border-0 shadow-none h-12 text-base leading-tight"

          />
        </TextField>

        <TextField isRequired>
          <View className="w-full flex-row items-center">
            <TextField.Input
              value={password}
              onChangeText={setPassword}
              className="flex-1 pr-10 rounded-xl bg-transparent-day border-0 shadow-none h-12 text-base leading-tight"
              placeholder="Password"
              secureTextEntry={!isPasswordVisible}
            />
            <Pressable
              className="absolute right-4"
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              {!isPasswordVisible ? <Eye /> : <EyeSlash />}
            </Pressable>
          </View>
        </TextField>
      </View>

      <View className='flex-row justify-end items-center mt-4'>
        <Link href="/auth/reset-password" asChild>
          <TouchableOpacity>
            <Text className='text-main text-base font-medium'>Forgot password?</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <View className='flex-col gap-8 mt-auto'>
        <View className='flex-row justify-center gap-2'>
          <Text className='text-hint text-base'>Don't have an account?</Text>
          <Text className='text-main text-base font-medium'>Sign up</Text>
        </View>

        <CustomButton className='w-full' onPress={() => { }}>
          Sign in
        </CustomButton>
      </View>
    </View>
  )
}

export default SignIn
import { View, Text, Pressable, TouchableOpacity } from 'react-native'
import React from 'react'
import { cn, InputOTP, TextField } from 'heroui-native'
import { useState } from 'react';
import Eye from '@/components/icons/eye';
import EyeSlash from '@/components/icons/eye-slash';
import { CustomButton } from '@/components/custom-button';
import { Link } from 'expo-router';

const steps = [
  {
    title: 'Reset your password',
    description: 'Enter your email, and we\'ll send you an OTP code in the next step to reset your password.',
  },
  {
    title: 'Enter Code',
    description: 'Please enter the code we just sent to email',
  },
  {
    title: 'Reset Password',
    description: 'Enter your new password and confirm it to reset your password.',
  },
]

const inputClass = 'rounded-xl bg-transparent-day border-0 shadow-none h-12 text-base leading-tight';


const ResetPassword = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const currentStepData = steps[currentStep];

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  }

  const handleSubmit = () => {
    if (currentStep === 0) {
      // TODO: Send OTP code to email
      handleNext();
    } else if (currentStep === 1) {
      // TODO: Verify OTP code
      handleNext();
    } else if (currentStep === 2) {
      // TODO: Reset password
    }
  }

  return (
    <View className='flex-1'>
      <View className='mb-6'>
        <Text className='text-2xl font-semibold'>{currentStepData.title}</Text>
        <Text className='text-base text-hint'>{currentStepData.description}</Text>
      </View>

      <View className="gap-4">
        {/* Step 0: Email Input */}
        {currentStep === 0 && (
          <TextField isRequired>
            <TextField.Input
              placeholder="Email Address"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              className={inputClass}
            />
          </TextField>
        )}

        {/* Step 1: OTP Input */}
        {currentStep === 1 && (
          <InputOTP
            maxLength={6}
            placeholder="——————"
            onComplete={(code) => {
              setCode(code);
              console.log(code);
            }}
          >
            <InputOTP.Group>
              {({ slots }) => (
                <>
                  {slots.map((slot, index) => (
                    <React.Fragment key={index}>
                      <InputOTP.Slot index={index} className={inputClass} />
                      {index === 2 && <InputOTP.Separator />}
                    </React.Fragment>
                  ))}
                </>
              )}
            </InputOTP.Group>
          </InputOTP>
        )}

        {/* Step 2: Password Fields */}
        {currentStep === 2 && (
          <>
            <TextField isRequired>
              <View className="w-full flex-row items-center">
                <TextField.Input
                  value={password}
                  onChangeText={setPassword}
                  className={cn(inputClass, 'flex-1 pr-10')}
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

            <TextField isRequired>
              <View className="w-full flex-row items-center">
                <TextField.Input
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  className={cn(inputClass, 'flex-1 pr-10')}
                  placeholder="Confirm Password"
                  secureTextEntry={!isConfirmPasswordVisible}
                />
                <Pressable
                  className="absolute right-4"
                  onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                >
                  {!isConfirmPasswordVisible ? <Eye /> : <EyeSlash />}
                </Pressable>
              </View>
            </TextField>
          </>
        )}
      </View>

      {/* Resend code - only show on step 1 */}
      {currentStep === 1 && (
        <View className='flex-row justify-start items-center'>
          <View className='flex-row justify-center mt-4 gap-2'>
            <Text className='text-hint text-base'>Didn't receive OTP?</Text>
            <Text className='text-main text-base font-medium underline'>Resend code</Text>
          </View>
        </View>
      )}

      <View className='mt-auto'>
        <CustomButton className='w-full' onPress={handleSubmit}>
          {currentStep === steps.length - 1 ? 'Submit' : 'Next'}
        </CustomButton>
      </View>
    </View>
  )
}

export default ResetPassword
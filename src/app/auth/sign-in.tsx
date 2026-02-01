import { CustomButton } from "@/components/custom-button";
import Eye from "@/components/icons/eye";
import EyeSlash from "@/components/icons/eye-slash";
import { Link } from "expo-router";
import { TextField } from "heroui-native";
import React, { useState } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View className="flex-1">
      <View className="mb-6">
        <Text className="text-2xl font-semibold">Sign in</Text>
        <Text className="text-hint text-base">
          Enter your email & password to sign in.
        </Text>
      </View>

      <View className="gap-4">
        <TextField isRequired>
          <TextField.Input
            placeholder="Email Address"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            className="bg-transparent-day h-12 rounded-xl border-0 text-base leading-tight shadow-none"
          />
        </TextField>

        <TextField isRequired>
          <View className="w-full flex-row items-center">
            <TextField.Input
              value={password}
              onChangeText={setPassword}
              className="bg-transparent-day h-12 flex-1 rounded-xl border-0 pr-10 text-base leading-tight shadow-none"
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

      <View className="mt-4 flex-row items-center justify-end">
        <Link href="/auth/reset-password" asChild>
          <TouchableOpacity>
            <Text className="text-main text-base font-medium">
              Forgot password?
            </Text>
          </TouchableOpacity>
        </Link>
      </View>

      <View className="mt-auto flex-col gap-8">
        <View className="flex-row justify-center gap-2">
          <Text className="text-hint text-base">Don't have an account?</Text>
          <Text className="text-main text-base font-medium">Sign up</Text>
        </View>

        <CustomButton className="w-full" onPress={() => {}}>
          Sign in
        </CustomButton>
      </View>
    </View>
  );
};

export default SignIn;

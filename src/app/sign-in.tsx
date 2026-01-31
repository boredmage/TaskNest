import React from "react";
import { View, Text, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

import { CustomButton } from "@/components/custom-button";
import AppleIcon from "@/components/icons/apple-icon";
import GoogleIcon from "@/components/icons/google-icon";
import { Button } from "heroui-native";
import XIcon from "@/components/icons/x-icon";

const SignIn = () => {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  const handleEmailSignIn = () => {
    // TODO: Navigate to email sign-in flow
  };

  const handleAppleSignIn = () => {
    // TODO: Implement Apple sign-in
    router.replace('/');
  };

  const handleGoogleSignIn = () => {
    // TODO: Implement Google sign-in
    router.replace('/');
  };

  return (
    <View className="flex-1 bg-main">
      <View className="flex-1 justify-center p-4">
        <View className="relative">
          {/* Decorative background pills, positioned relative to form */}
          <Image
            source={require("@/assets/pill.png")}
            className="absolute -top-20 -left-20 w-56 h-56"
          />
          <Image
            source={require("@/assets/pill.png")}
            className="absolute -bottom-28 -right-24 w-64 h-64"
          />

          <View className="bg-white rounded-4xl px-6 py-8 shadow-sm z-10">
            {/* Close button */}
            <View className="items-end mb-4">
              <Button
                onPress={handleClose}
                className="w-8 h-8 rounded-full"
                accessibilityLabel="Close"
                variant="tertiary"
              >
                <XIcon />
              </Button>
            </View>

            {/* Heading */}
            <View className="mb-6">
              <Text className="text-2xl font-semibold mb-2">Welcome to TaskNest!</Text>
              <Text className="text-base text-hint leading-snug">
                Create tasks, share responsibilities, and keep your family life running smoothly —
                all in one place.
              </Text>
            </View>

            {/* Primary sign-in button */}
            <CustomButton
              className="w-full bg-black mt-1"
              labelClassName="text-white"
              onPress={handleEmailSignIn}
            >
              Sign in
            </CustomButton>

            {/* Continue with email */}
            <Button
              variant="tertiary"
              className="w-full mt-3 rounded-xl"
              onPress={handleEmailSignIn}
            >

              Continue with Email
            </Button>

            {/* Social sign-in options */}
            <View className="flex-row gap-3 mt-4">
              <Button
                variant="tertiary"
                className="flex-1 rounded-xl"
                onPress={handleAppleSignIn}
              >
                <AppleIcon />
              </Button>
              <Button
                variant="tertiary"
                className="flex-1 rounded-xl"
                onPress={handleGoogleSignIn}
              >
                <GoogleIcon />
              </Button>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default SignIn;
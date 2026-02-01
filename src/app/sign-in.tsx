import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";

import { CustomButton } from "@/components/custom-button";
import AppleIcon from "@/components/icons/apple-icon";
import GoogleIcon from "@/components/icons/google-icon";
import XIcon from "@/components/icons/x-icon";
import { Button } from "heroui-native";

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
    router.replace("/");
  };

  const handleGoogleSignIn = () => {
    // TODO: Implement Google sign-in
    router.replace("/");
  };

  return (
    <View className="bg-main flex-1">
      <View className="flex-1 justify-center p-4">
        <View className="relative">
          {/* Decorative background pills, positioned relative to form */}
          <Image
            source={require("@/assets/pill.png")}
            className="absolute -top-20 -left-20 h-56 w-56"
          />
          <Image
            source={require("@/assets/pill.png")}
            className="absolute -right-24 -bottom-28 h-64 w-64"
          />

          <View className="z-10 rounded-4xl bg-white px-6 py-8 shadow-sm">
            {/* Close button */}
            <View className="mb-4 items-end">
              <Button
                onPress={handleClose}
                className="h-8 w-8 rounded-full"
                accessibilityLabel="Close"
                variant="tertiary"
              >
                <XIcon />
              </Button>
            </View>

            {/* Heading */}
            <View className="mb-6">
              <Text className="mb-2 text-2xl font-semibold">
                Welcome to TaskNest!
              </Text>
              <Text className="text-hint text-base leading-snug">
                Create tasks, share responsibilities, and keep your family life
                running smoothly — all in one place.
              </Text>
            </View>

            {/* Primary sign-in button */}
            <CustomButton
              className="mt-1 w-full bg-black"
              labelClassName="text-white"
              onPress={handleEmailSignIn}
            >
              Sign in
            </CustomButton>

            {/* Continue with email */}
            <Button
              variant="tertiary"
              className="mt-3 w-full rounded-xl"
              onPress={handleEmailSignIn}
            >
              Continue with Email
            </Button>

            {/* Social sign-in options */}
            <View className="mt-4 flex-row gap-3">
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

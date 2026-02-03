import { CustomButton } from "@/components/custom-button";
import Eye from "@/components/icons/eye";
import EyeSlash from "@/components/icons/eye-slash";
import { useAppTheme } from "@/contexts/app-theme-context";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { Spinner, TextField, Toast, useToast } from "heroui-native";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { isDark } = useAppTheme();

  const showErrorToast = (title: string, description: string) => {
    toast.show({
      component: (props) => (
        <Toast
          variant="danger"
          {...props}
          className="rounded-xl border border-neutral-100 p-3"
        >
          <Toast.Title>{title}</Toast.Title>
          <Toast.Description>{description}</Toast.Description>
        </Toast>
      ),
    });
  };

  const showSuccessToast = (title: string, description: string) => {
    toast.show({
      component: (props) => (
        <Toast
          variant="success"
          {...props}
          className="rounded-xl border border-neutral-100 p-3"
        >
          <Toast.Title>{title}</Toast.Title>
          <Toast.Description>{description}</Toast.Description>
        </Toast>
      ),
    });
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  async function signUpWithEmail() {
    // Check if passwords match
    const doPasswordsMatch =
      password === confirmPassword && password.length > 0;

    if (!isValidEmail(email)) {
      showErrorToast(
        "Invalid email address",
        "Please enter a valid email address"
      );
      return;
    }

    if (!doPasswordsMatch) {
      showErrorToast(
        "Passwords do not match",
        "Please enter the same password in both fields"
      );
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        throw error;
      }

      showSuccessToast(
        "Registration successful",
        `Please check your email to confirm your registration, then sign in. If you don't see the email, check your spam folder.`
      );
      setEmail("");
      setPassword("");
    } catch (error) {
      showErrorToast("Error", (error as Error).message);
      console.error("[SIGN UP] Error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1">
      <View className="mb-6">
        <Text className="text-text-day dark:text-text-night text-2xl font-semibold">
          Sign up
        </Text>
        <Text className="text-hint text-base">
          Enter your email & password to sign up.
        </Text>
      </View>

      <View className="gap-4">
        <TextField isRequired isDisabled={loading}>
          <TextField.Input
            placeholder="Email Address"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            className="bg-transparent-day dark:bg-transparent-night h-12 rounded-xl border-0 text-base leading-tight shadow-none"
          />
        </TextField>

        <TextField isRequired isDisabled={loading}>
          <View className="w-full flex-row items-center">
            <TextField.Input
              value={password}
              onChangeText={setPassword}
              className="bg-transparent-day dark:bg-transparent-night h-12 flex-1 rounded-xl border-0 pr-10 text-base leading-tight shadow-none"
              placeholder="Password"
              secureTextEntry={!isPasswordVisible}
            />
            <Pressable
              className="absolute right-4"
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              {!isPasswordVisible ? (
                <Eye
                  color={isDark ? "#FFFFFF" : "#1B1B1B"}
                  width={20}
                  height={20}
                />
              ) : (
                <EyeSlash
                  color={isDark ? "#FFFFFF" : "#1B1B1B"}
                  width={20}
                  height={20}
                />
              )}
            </Pressable>
          </View>
        </TextField>

        <TextField isRequired isDisabled={loading}>
          <View className="w-full flex-row items-center">
            <TextField.Input
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              className="bg-transparent-day dark:bg-transparent-night h-12 flex-1 rounded-xl border-0 pr-10 text-base leading-tight shadow-none"
              placeholder="Confirm Password"
              secureTextEntry={!isConfirmPasswordVisible}
            />
            <Pressable
              className="absolute right-4"
              onPress={() =>
                setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
              }
            >
              {!isConfirmPasswordVisible ? (
                <Eye
                  color={isDark ? "#FFFFFF" : "#1B1B1B"}
                  width={20}
                  height={20}
                />
              ) : (
                <EyeSlash
                  color={isDark ? "#FFFFFF" : "#1B1B1B"}
                  width={20}
                  height={20}
                />
              )}
            </Pressable>
          </View>
        </TextField>
      </View>

      <View className="mt-auto flex-col gap-8">
        <View className="flex-row justify-center gap-2">
          <Text className="text-hint text-base">Already have an account?</Text>
          <Pressable
            onPress={() => router.replace("/auth/sign-in")}
            hitSlop={10}
          >
            <Text className="text-main text-base font-medium">Sign in</Text>
          </Pressable>
        </View>

        <CustomButton
          className="w-full"
          onPress={signUpWithEmail}
          isDisabled={loading}
        >
          {loading ? <Spinner color="#72D000" /> : "Sign up"}
        </CustomButton>
      </View>
    </View>
  );
};

export default SignUp;

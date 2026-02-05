import { CustomButton } from "@/components/custom-button";
import Eye from "@/components/icons/eye";
import EyeSlash from "@/components/icons/eye-slash";
import { useAppTheme } from "@/contexts/app-theme-context";
import { supabase } from "@/lib/supabase";
import { AuthError } from "@supabase/supabase-js";
import { Link, useRouter } from "expo-router";
import { Spinner, TextField, Toast, useToast } from "heroui-native";
import React, { useState } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
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

  const signInWithEmail = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw error;
      }

      router.replace("/");
    } catch (error) {
      if (error instanceof AuthError) {
        if (error.code === "invalid_credentials") {
          showErrorToast(
            "Invalid credentials",
            "Please check your email and password"
          );
        }

        if (error.code === "email_not_confirmed") {
          showErrorToast(
            "Email not confirmed",
            "Please check your email for a confirmation link"
          );
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1">
      <View className="mb-6">
        <Text className="text-text-day dark:text-text-night text-2xl font-semibold">
          Sign in
        </Text>
        <Text className="text-hint text-base">
          Enter your email & password to sign in.
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
          <Pressable
            onPress={() => router.replace("/auth/sign-up")}
            hitSlop={10}
          >
            <Text className="text-main text-base font-medium">Sign up</Text>
          </Pressable>
        </View>

        <CustomButton
          className="w-full"
          onPress={signInWithEmail}
          isDisabled={loading}
        >
          {loading ? <Spinner color="#72D000" /> : "Sign in"}
        </CustomButton>
      </View>
    </View>
  );
};

export default SignIn;

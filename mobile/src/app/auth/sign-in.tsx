import { CustomButton } from "@/components/custom-button";
import Eye from "@/components/icons/eye";
import EyeSlash from "@/components/icons/eye-slash";
import { useAppTheme } from "@/contexts/app-theme-context";
import { ApiError, errorMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
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
  const { signIn } = useAuthStore();
  const canSubmit = email.trim().length > 0 && password.length > 0;

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
      await signIn(email.trim(), password);
    } catch (error) {
      if (error instanceof ApiError && error.code === "invalid_credentials") {
        showErrorToast(
          "Invalid credentials",
          "Please check your email and password"
        );
      } else if (
        error instanceof ApiError &&
        error.code === "validation_error"
      ) {
        showErrorToast(
          "Check your details",
          "Enter a valid email and password"
        );
      } else {
        showErrorToast(
          "Could not sign in",
          errorMessage(error, "Please check your connection and try again")
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1">
      <View className="mb-6 gap-2">
        <Text className="text-text-day dark:text-text-night text-xl font-semibold">
          Sign in
        </Text>
        <Text className="text-hint text-base">
          Enter your email & password to sign in.
        </Text>
      </View>

      <View className="gap-6">
        <TextField isRequired isDisabled={loading}>
          <TextField.Input
            placeholder="Email Address"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            className="bg-transparent-day dark:bg-transparent-night h-[50px] rounded-xl border-0 text-base leading-tight shadow-none"
          />
        </TextField>

        <TextField isRequired isDisabled={loading}>
          <View className="w-full flex-row items-center">
            <TextField.Input
              value={password}
              onChangeText={setPassword}
              className="bg-transparent-day dark:bg-transparent-night h-[50px] flex-1 rounded-xl border-0 pr-10 text-base leading-tight shadow-none"
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
            <Text className="text-main text-base font-semibold">
              Forgot password?
            </Text>
          </TouchableOpacity>
        </Link>
      </View>

      <View className="mt-auto flex-col gap-10">
        <View className="flex-row justify-center gap-2">
          <Text className="text-hint text-base">Don't have an account?</Text>
          <Pressable
            onPress={() => router.replace("/auth/sign-up")}
            hitSlop={10}
          >
            <Text className="text-main text-base font-semibold">Sign up</Text>
          </Pressable>
        </View>

        <CustomButton
          className="h-[50px] w-full"
          onPress={signInWithEmail}
          isDisabled={loading || !canSubmit}
        >
          {loading ? <Spinner color="#72D000" /> : "Next"}
        </CustomButton>
      </View>
    </View>
  );
};

export default SignIn;

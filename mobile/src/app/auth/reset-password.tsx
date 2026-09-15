import { CustomButton } from "@/components/custom-button";
import Eye from "@/components/icons/eye";
import EyeSlash from "@/components/icons/eye-slash";
import { auth, errorMessage } from "@/lib/api";
import { useRouter } from "expo-router";
import {
  cn,
  InputOTP,
  Spinner,
  TextField,
  Toast,
  useToast,
} from "heroui-native";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";

const steps = [
  {
    title: "Reset your password",
    description:
      "Enter your email, and we'll send you an OTP code in the next step to reset your password.",
  },
  {
    title: "Enter Code",
    description: "Please enter the code we just sent to email",
  },
  {
    title: "Reset Password",
    description:
      "Enter your new password and confirm it to reset your password.",
  },
];

const inputClass =
  "rounded-xl bg-transparent-day border-0 shadow-none h-12 text-base leading-tight";

const ResetPassword = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const currentStepData = steps[currentStep];

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const [resetToken, setResetToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const showToast = (
    variant: "danger" | "success",
    title: string,
    description: string
  ) => {
    toast.show({
      component: (props) => (
        <Toast
          variant={variant}
          {...props}
          className="rounded-xl border border-neutral-100 p-3"
        >
          <Toast.Title>{title}</Toast.Title>
          <Toast.Description>{description}</Toast.Description>
        </Toast>
      ),
    });
  };

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const sendCode = async () => {
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      showToast("danger", "Invalid email", "Enter a valid email address");
      return false;
    }
    setLoading(true);
    try {
      await auth.forgotPassword(trimmed);
      showToast(
        "success",
        "Code sent",
        "If an account exists for this email, a 6-digit code is on its way."
      );
      return true;
    } catch (error) {
      showToast("danger", "Could not send code", errorMessage(error));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (loading) return;

    if (currentStep === 0) {
      if (await sendCode()) handleNext();
      return;
    }

    if (currentStep === 1) {
      if (code.length !== 6) {
        showToast("danger", "Enter the code", "The code is 6 digits long");
        return;
      }
      setLoading(true);
      try {
        const { reset_token } = await auth.verifyResetCode(email.trim(), code);
        setResetToken(reset_token);
        handleNext();
      } catch (error) {
        showToast("danger", "Invalid code", errorMessage(error));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (currentStep === 2) {
      if (password.length < 8) {
        showToast(
          "danger",
          "Password too short",
          "Use at least 8 characters for your password"
        );
        return;
      }
      if (password !== confirmPassword) {
        showToast(
          "danger",
          "Passwords do not match",
          "Please enter the same password in both fields"
        );
        return;
      }
      if (!resetToken) {
        setCurrentStep(1);
        return;
      }
      setLoading(true);
      try {
        await auth.resetPassword(resetToken, password);
        showToast(
          "success",
          "Password updated",
          "You can now sign in with your new password."
        );
        router.replace("/auth/sign-in");
      } catch (error) {
        showToast("danger", "Could not reset password", errorMessage(error));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View className="flex-1">
      <View className="mb-6">
        <Text className="text-xl font-semibold">{currentStepData.title}</Text>
        <Text className="text-hint text-base">
          {currentStepData.description}
        </Text>
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
            value={code}
            onChange={setCode}
            onComplete={(code) => {
              setCode(code);
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
                  className={cn(inputClass, "flex-1 pr-10")}
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
                  className={cn(inputClass, "flex-1 pr-10")}
                  placeholder="Confirm Password"
                  secureTextEntry={!isConfirmPasswordVisible}
                />
                <Pressable
                  className="absolute right-4"
                  onPress={() =>
                    setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                  }
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
        <View className="flex-row items-center justify-start">
          <View className="mt-4 flex-row justify-center gap-2">
            <Text className="text-hint text-base">Didn't receive OTP?</Text>
            <Pressable onPress={sendCode} disabled={loading} hitSlop={10}>
              <Text className="text-main text-base font-medium underline">
                Resend code
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      <View className="mt-auto">
        <CustomButton
          className="w-full"
          onPress={handleSubmit}
          isDisabled={loading}
        >
          {loading ? (
            <Spinner color="#72D000" />
          ) : currentStep === steps.length - 1 ? (
            "Submit"
          ) : (
            "Next"
          )}
        </CustomButton>
      </View>
    </View>
  );
};

export default ResetPassword;

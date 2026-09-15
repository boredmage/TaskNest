import { CustomButton } from "@/components/custom-button";
import AppleIcon from "@/components/icons/apple-icon";
import GoogleIcon from "@/components/icons/google-icon";
import XIcon from "@/components/icons/x-icon";
import { useAppTheme } from "@/contexts/app-theme-context";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

/** The "Welcome to TaskNest!" sign-in card (Figma 2:240). */
export function WelcomeCard({ onClose }: { onClose: () => void }) {
  const { isDark } = useAppTheme();
  return (
    <View className="bg-background-day dark:bg-background-night items-end gap-6 rounded-[20px] px-4 pt-5 pb-10">
      <Pressable
        onPress={onClose}
        hitSlop={12}
        accessibilityLabel="Close"
        className="bg-transparent-day dark:bg-transparent-night size-7 items-center justify-center rounded-full active:opacity-70"
      >
        <XIcon width={16} height={16} />
      </Pressable>

      <View className="w-full gap-2.5">
        <Text className="text-text-day dark:text-text-night text-xl font-semibold">
          Welcome to TaskNest!
        </Text>
        <Text className="text-hint text-base leading-snug">
          Create tasks, share responsibilities, and keep your family life
          running smoothly — all in one place.
        </Text>
      </View>

      <View className="w-full gap-2.5">
        <Link href="/auth/sign-in" asChild>
          <CustomButton
            className="h-[50px] w-full bg-[#1B1B1B] dark:bg-white"
            labelClassName="font-medium text-white dark:text-[#222222]"
          >
            Sign in
          </CustomButton>
        </Link>
        <Link href="/auth/sign-up" asChild>
          <CustomButton
            className="bg-transparent-day dark:bg-transparent-night h-[50px] w-full"
            labelClassName="text-text-day dark:text-text-night font-medium"
          >
            Continue with Email
          </CustomButton>
        </Link>
        <View className="flex-row gap-2.5">
          <SocialButton label="Continue with Apple">
            <AppleIcon
              width={20}
              height={20}
              color={isDark ? "#FFFFFF" : "#1B1B1B"}
            />
          </SocialButton>
          <SocialButton label="Continue with Google">
            <GoogleIcon
              width={20}
              height={20}
              color={isDark ? "#FFFFFF" : "#1B1B1B"}
            />
          </SocialButton>
        </View>
      </View>
    </View>
  );
}

function SocialButton({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      onPress={() => {
        // Social sign-in is not wired to the server yet.
      }}
      className="bg-transparent-day dark:bg-transparent-night h-[50px] flex-1 items-center justify-center rounded-xl active:opacity-70"
    >
      {children}
    </Pressable>
  );
}

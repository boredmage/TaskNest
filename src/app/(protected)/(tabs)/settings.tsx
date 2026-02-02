import { useRouter } from "expo-router";
import { Button, cn } from "heroui-native";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import User from "@/components/icons/user";
import { useAppTheme } from "@/contexts/app-theme-context";
import { UPDATE_PROFILE_REDIRECT_KEY } from "@/lib/constant";
import { supabase } from "@/lib/supabase";
import { getAvatarUrl } from "@/lib/util";
import { useProfileStore } from "@/stores/profile-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Avatar } from "heroui-native";
import { CustomSwitch } from "../../../components/custom-switch";
import AboutFile from "../../../components/icons/about-file";
import ChevronRight from "../../../components/icons/chevron-right";
import Globe from "../../../components/icons/globe";
import Info from "../../../components/icons/info";
import Message from "../../../components/icons/message";
import Moon from "../../../components/icons/moon";
import NotificationBell from "../../../components/icons/notification-bell";
import Shield from "../../../components/icons/shield";

const Settings = () => {
  const router = useRouter();
  const { isDark, toggleTheme } = useAppTheme();
  const { profile, clearProfile } = useProfileStore();
  const { t } = useTranslation();

  const Row = ({
    title,
    icon,
    onPress,
    right,
  }: {
    title: string;
    icon: React.ReactNode;
    onPress?: () => void;
    right?: React.ReactNode;
  }) => {
    const content = (
      <View className="flex-row items-center">
        <View className="bg-main-light size-10 items-center justify-center rounded-lg">
          {icon}
        </View>
        <Text className="text-text-day dark:text-text-night ml-4 flex-1 text-base">
          {title}
        </Text>
        <View className="ml-3">{right}</View>
      </View>
    );

    if (!onPress) return content;

    return (
      <Pressable onPress={onPress} className="active:opacity-70">
        {content}
      </Pressable>
    );
  };

  const handleSignOut = async () => {
    await AsyncStorage.removeItem(UPDATE_PROFILE_REDIRECT_KEY);
    await supabase.auth.signOut();
    clearProfile();
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDark ? "#222222" : "#F2F2F2",
      }}
    >
      <Text className="text-text-day dark:text-text-night my-2 self-center text-2xl font-semibold">
        {t("tabs.settings")}
      </Text>

      <ScrollView
        className="grow"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 pt-4 pb-24">
          <Pressable
            className="mb-4 active:opacity-90"
            onPress={() => router.push("/settings/profile")}
          >
            <View className="bg-primary-day dark:bg-primary-night flex-row items-center rounded-xl p-4">
              {/* <View className="size-14 overflow-hidden rounded-full bg-[#E5E5E5]">
                <Image
                  source={{
                    uri: getAvatarUrl(profile?.avatar_url ?? null),
                  }}
                  className="h-full w-full"
                />
              </View> */}
              <Avatar
                alt="User"
                className="bg-transparent-day dark:bg-transparent-night size-14"
              >
                <Avatar.Image
                  source={{
                    uri: getAvatarUrl(profile?.avatar_url ?? null) || undefined,
                  }}
                />
                <Avatar.Fallback color="accent">
                  <User width={24} height={24} color="#A0A0A0" />
                </Avatar.Fallback>
              </Avatar>
              <View className="ml-4 flex-1">
                <Text
                  className={cn(
                    "text-base",
                    profile?.full_name
                      ? "text-text-day dark:text-text-night font-semibold"
                      : "text-hint/50 font-light"
                  )}
                >
                  {profile?.full_name ?? "Click to update your profile"}
                </Text>
                <Text className="text-hint text-sm">{profile?.email}</Text>
              </View>
              <ChevronRight />
            </View>
          </Pressable>

          <View className="bg-primary-day dark:bg-primary-night gap-4 rounded-xl p-4">
            <Row
              title={t("settings.security")}
              icon={<Shield />}
              onPress={() => router.push("/settings/security")}
            />
            <Row
              title={t("settings.notifications")}
              icon={<NotificationBell />}
              onPress={() => router.push("/settings/notifications")}
            />
            <Row
              title={t("settings.language")}
              icon={<Globe />}
              onPress={() => router.push("/settings/language")}
            />
            <Row
              title={t("settings.darkMode")}
              icon={<Moon />}
              right={
                <CustomSwitch
                  value={isDark}
                  onValueChange={() => toggleTheme()}
                  size="medium"
                />
              }
            />
            <Row
              title={t("settings.support")}
              icon={<Message />}
              onPress={() => {}}
            />
          </View>

          <View className="bg-primary-day dark:bg-primary-night mt-4 gap-4 rounded-xl p-4">
            <Row
              title={t("settings.helpCenter")}
              icon={<Info />}
              onPress={() => {}}
            />
            <Row
              title={t("settings.about")}
              icon={<AboutFile />}
              onPress={() => {}}
            />
          </View>

          <View className="pt-4 pb-6">
            <Button
              variant="danger-soft"
              className="rounded-xl"
              onPress={handleSignOut}
            >
              {t("settings.logout")}
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;

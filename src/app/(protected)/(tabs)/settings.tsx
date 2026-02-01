import { View, Text, Pressable, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "heroui-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { CustomSwitch } from "../../../components/custom-switch";
import Shield from "../../../components/icons/shield";
import NotificationBell from "../../../components/icons/notification-bell";
import Globe from "../../../components/icons/globe";
import Moon from "../../../components/icons/moon";
import Message from "../../../components/icons/message";
import Info from "../../../components/icons/info";
import AboutFile from "../../../components/icons/about-file";
import ChevronRight from "../../../components/icons/chevron-right";
import { useAppTheme } from "@/contexts/app-theme-context";

const Settings = () => {
  const router = useRouter();
  const { isDark, toggleTheme } = useAppTheme();

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
        <View className="size-10 rounded-lg bg-main-light items-center justify-center">
          {icon}
        </View>
        <Text className="ml-4 text-base text-text-day dark:text-text-night flex-1">
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

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDark ? "#222222" : "#F2F2F2",
      }}
    >
      <Text className="text-2xl font-semibold text-text-day dark:text-text-night self-center mb-4">
        {t("tabs.settings")}
      </Text>

      <ScrollView
        className="grow"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 pb-24">
          <Pressable
            className="mb-4 active:opacity-90"
            onPress={() => router.push("/settings/profile")}
          >
            <View className="bg-primary-day dark:bg-primary-night rounded-xl p-4 flex-row items-center">
              <View className="size-14 rounded-full overflow-hidden bg-[#E5E5E5]">
                <Image
                  source={{
                    uri: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=120&h=120",
                  }}
                  className="w-full h-full"
                />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-base font-semibold text-text-day dark:text-text-night">
                  Alex Johnson
                </Text>
                <Text className="text-sm text-hint">example@domain.com</Text>
              </View>
              <ChevronRight />
            </View>
          </Pressable>

          <View className="bg-primary-day dark:bg-primary-night rounded-xl p-4 gap-4">
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

          <View className="bg-primary-day dark:bg-primary-night rounded-xl p-4 gap-4 mt-4">
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

          <View className="pb-6 pt-4">
            <Button
              variant="danger-soft"
              className="rounded-xl"
              onPress={() => router.replace("/onboarding")}
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

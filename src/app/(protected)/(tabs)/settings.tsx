import { View, Text, Pressable, Image } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "heroui-native";
import { useRouter } from "expo-router";
import { CustomSwitch } from "../../../components/custom-switch";

import Shield from "../../../components/icons/shield";
import NotificationBell from "../../../components/icons/notification-bell";
import Globe from "../../../components/icons/globe";
import Moon from "../../../components/icons/moon";
import Message from "../../../components/icons/message";
import Info from "../../../components/icons/info";
import AboutFile from "../../../components/icons/about-file";
import ChevronRight from "../../../components/icons/chevron-right";

const Settings = () => {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);

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
        <View className="size-10 rounded-lg bg-secondary items-center justify-center">
          {icon}
        </View>
        <Text className="ml-4 text-base text-black flex-1">{title}</Text>
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
      style={{ flex: 1 }}
    >
      <View className="flex-1 bg-[#F2F2F2] px-4">
        <Text className="text-2xl font-semibold text-black self-center mb-4">
          Settings
        </Text>

        <Pressable className="mb-4 active:opacity-90" onPress={() => router.push("/settings/profile")}>
          <View className="bg-white rounded-xl p-4 flex-row items-center">
            <View className="size-14 rounded-full overflow-hidden bg-[#E5E5E5]">
              <Image
                source={{
                  uri: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=120&h=120",
                }}
                className="w-full h-full"
              />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-base font-semibold text-black">
                Alex Johnson
              </Text>
              <Text className="text-sm text-hint-day">
                example@domain.com
              </Text>
            </View>
            <ChevronRight />
          </View>
        </Pressable>

        <View className="bg-white rounded-xl p-4 gap-4">
          <Row title="Security" icon={<Shield />} onPress={() => router.push("/settings/security")} />
          <Row title="Notifications" icon={<NotificationBell />} onPress={() => router.push("/settings/notifications")} />
          <Row title="Language" icon={<Globe />} onPress={() => { }} />
          <Row
            title="Dark Mode"
            icon={<Moon />}
            right={
              <CustomSwitch
                value={isDarkMode}
                onValueChange={setIsDarkMode}
                size="medium"
              />
            }
          />
          <Row title="Support" icon={<Message />} onPress={() => { }} />
        </View>

        <View className="bg-white rounded-xl p-4 gap-4 mt-4">
          <Row title="Help Center" icon={<Info />} onPress={() => { }} />
          <Row title="About TaskNest" icon={<AboutFile />} onPress={() => { }} />
        </View>

        <View className="pb-6 pt-4">
          <Button
            variant="danger-soft"
            className="rounded-xl"
            onPress={() => router.replace("/onboarding")}
          >
            Logout
          </Button>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default Settings
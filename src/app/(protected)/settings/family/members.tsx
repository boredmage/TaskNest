import PlusIcon from "@/components/icons/plus";
import { useAppTheme } from "@/contexts/app-theme-context";
import WithArrowBack from "@/layout/with-arrow-back";
import { Avatar } from "heroui-native";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

const MEMBERS = [
  {
    id: "1",
    name: "Emma",
    role: "owner",
    avatarUri: "https://i.pravatar.cc/96?img=1",
  },
  {
    id: "2",
    name: "Dad",
    role: "can edit",
    avatarUri: "https://i.pravatar.cc/96?img=12",
  },
  {
    id: "3",
    name: "Mom",
    role: "can edit",
    avatarUri: "https://i.pravatar.cc/96?img=5",
  },
  {
    id: "4",
    name: "Alex",
    role: "can edit",
    avatarUri: "https://i.pravatar.cc/96?img=11",
  },
] as const;

const FamilyMembers = () => {
  const { isDark } = useAppTheme();

  return (
    <WithArrowBack
      title="Family members"
      right={
        <Pressable
          onPress={() => {
            // TODO: add family member
          }}
        >
          <PlusIcon
            stroke={isDark ? "#FFFFFF" : "#1B1B1B"}
            width={24}
            height={24}
          />
        </Pressable>
      }
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-2 pt-4"
        showsVerticalScrollIndicator={false}
      >
        {MEMBERS.map((member) => (
          <View
            key={member.id}
            className="bg-primary-day dark:bg-primary-night flex-row items-center rounded-xl p-2.5 px-4"
          >
            <Avatar
              alt={member.name}
              className="bg-transparent-day dark:bg-transparent-night size-14 shrink-0"
            >
              <Avatar.Image source={{ uri: member.avatarUri }} />
              <Avatar.Fallback color="accent" />
            </Avatar>
            <View className="ml-4 flex-1">
              <Text className="text-text-day dark:text-text-night text-base font-semibold">
                {member.name}
              </Text>
              <Text className="text-hint mt-0.5 text-sm">{member.role}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </WithArrowBack>
  );
};

export default FamilyMembers;

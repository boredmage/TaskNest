import PlusIcon from "@/components/icons/plus";
import User from "@/components/icons/user";
import { useAppTheme } from "@/contexts/app-theme-context";
import WithArrowBack from "@/layout/with-arrow-back";
import { getAvatarUrl } from "@/lib/util";
import { useFamilyStore } from "@/stores/family-store";
import { Avatar } from "heroui-native";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

const FamilyMembers = () => {
  const { isDark } = useAppTheme();
  const { members } = useFamilyStore();

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
        {members.map((member) => (
          <View
            key={member.id}
            className="bg-primary-day dark:bg-primary-night flex-row items-center rounded-xl p-2.5 px-4"
          >
            <Avatar
              alt={member.name}
              className="bg-transparent-day dark:bg-transparent-night size-14 shrink-0"
            >
              {member.avatar_url ? (
                <Avatar.Image
                  source={{
                    uri: getAvatarUrl(member.avatar_url) ?? undefined,
                  }}
                />
              ) : null}
              <Avatar.Fallback color="accent">
                <User width={20} height={20} color="#A0A0A0" />
              </Avatar.Fallback>
            </Avatar>
            <View className="ml-4 flex-1">
              <Text className="text-text-day dark:text-text-night text-base font-semibold">
                {member.name}
              </Text>
              <Text className="text-hint mt-0.5 text-sm capitalize">
                {member.role}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </WithArrowBack>
  );
};

export default FamilyMembers;

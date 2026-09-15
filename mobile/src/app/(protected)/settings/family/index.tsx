import { InviteFamilyMemberDialog } from "@/components/dialog/invite-family-member-dialog";
import ChevronRight from "@/components/icons/chevron-right";
import PlusIcon from "@/components/icons/plus";
import User from "@/components/icons/user";
import WithArrowBack from "@/layout/with-arrow-back";
import { CATEGORIES } from "@/lib/categories";
import { getAvatarUrl } from "@/lib/util";
import { useFamilyStore } from "@/stores/family-store";
import { useProfileStore } from "@/stores/profile-store";
import { countByCategory, useTodosStore } from "@/stores/todos-store";
import { Link } from "expo-router";
import { Avatar } from "heroui-native";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

/** Family overview (Figma 205:6049): category counts + member avatars. */
const FamilySettings = () => {
  const { members, family } = useFamilyStore();
  const { profile } = useProfileStore();
  const { todos } = useTodosStore();
  const isOwner = !!family && !!profile && family.owner_id === profile.id;
  const categoryCounts = useMemo(
    () => countByCategory(todos.filter((t) => t.scope === "family")),
    [todos]
  );
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  return (
    <WithArrowBack>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-2 pt-3 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-primary-day dark:bg-primary-night overflow-hidden rounded-xl py-1">
          {CATEGORIES.map(({ id, label, Icon, tint }) => (
            <View
              key={id}
              className="h-[58px] flex-row items-center gap-3 px-4"
            >
              <View
                className="size-10 items-center justify-center rounded-full"
                style={{ backgroundColor: tint }}
              >
                <Icon width={20} height={20} />
              </View>
              <Text className="text-text-day dark:text-text-night flex-1 text-base font-medium">
                {label}
              </Text>
              <Text className="text-hint text-base">
                {categoryCounts[id] ?? 0}
              </Text>
              <ChevronRight />
            </View>
          ))}
        </View>

        <View className="bg-primary-day dark:bg-primary-night gap-4 rounded-xl p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-text-day dark:text-text-night text-base font-semibold">
              Family members
            </Text>
            <Link href="/settings/family/members" asChild>
              <Pressable hitSlop={8}>
                <Text className="text-base text-[#006FFF]">See All</Text>
              </Pressable>
            </Link>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-3 items-center"
          >
            {isOwner ? (
              <Pressable
                className="bg-transparent-day dark:bg-transparent-night size-14 items-center justify-center rounded-full active:opacity-80"
                onPress={() => setInviteDialogOpen(true)}
              >
                <PlusIcon width={24} height={24} stroke="#A0A0A0" />
              </Pressable>
            ) : null}
            {members.map((member) => (
              <Avatar
                key={member.id}
                alt={member.name}
                className="bg-transparent-day dark:bg-transparent-night size-14"
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
            ))}
          </ScrollView>
        </View>
      </ScrollView>
      <InviteFamilyMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />
    </WithArrowBack>
  );
};

export default FamilySettings;

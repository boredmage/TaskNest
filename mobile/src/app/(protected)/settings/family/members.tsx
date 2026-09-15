import { InviteFamilyMemberDialog } from "@/components/dialog/invite-family-member-dialog";
import PlusIcon from "@/components/icons/plus";
import User from "@/components/icons/user";
import { useAppTheme } from "@/contexts/app-theme-context";
import WithArrowBack from "@/layout/with-arrow-back";
import { getAvatarUrl } from "@/lib/util";
import { roleLabel, useFamilyStore } from "@/stores/family-store";
import { useProfileStore } from "@/stores/profile-store";
import { Avatar } from "heroui-native";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

/** Family members list (Figma 205:6329 / 205:6382); the owner can invite. */
const FamilyMembers = () => {
  const { isDark } = useAppTheme();
  const { members, family } = useFamilyStore();
  const myId = useProfileStore((s) => s.profile?.id);
  const isOwner = !!family && !!myId && family.owner_id === myId;
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  return (
    <WithArrowBack
      title="Family Members"
      right={
        isOwner ? (
          <Pressable onPress={() => setInviteDialogOpen(true)} hitSlop={10}>
            <PlusIcon
              stroke={isDark ? "#FFFFFF" : "#1B1B1B"}
              width={28}
              height={28}
            />
          </Pressable>
        ) : null
      }
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-2 pt-3 pb-10"
        showsVerticalScrollIndicator={false}
      >
        {members.map((member) => (
          <View
            key={member.id}
            className="bg-primary-day dark:bg-primary-night flex-row items-center gap-3 rounded-xl px-4 py-2.5"
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
            <View className="flex-1 gap-2">
              <Text className="text-text-day dark:text-text-night text-base font-medium">
                {member.name}
                {member.user_id === myId ? " (you)" : ""}
              </Text>
              <Text className="text-hint text-sm">
                {roleLabel(member.role)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <InviteFamilyMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />
    </WithArrowBack>
  );
};

export default FamilyMembers;

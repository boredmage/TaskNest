import { supabase } from "@/lib/supabase";
import { getAvatarUrl } from "@/lib/util";
import { AppNotification } from "@/stores/notifications-store";
import { format } from "date-fns";
import { Avatar } from "heroui-native";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import User from "../icons/user";

const InviteNotification = ({
  notification,
}: {
  notification: AppNotification;
}) => {
  const [initiatorName, setInitiatorName] = useState<string>("Someone");
  const [initiatorAvatarUrl, setInitiatorAvatarUrl] = useState<string | null>(
    null
  );

  useEffect(() => {
    const initiatorId = notification?.initiator_id;
    if (!initiatorId) return;

    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", initiatorId)
        .maybeSingle();

      if (cancelled) return;
      const row = data as {
        full_name?: string | null;
        avatar_url?: string | null;
      } | null;
      const name = row?.full_name;
      setInitiatorName(name?.trim() ? name : "Someone");
      setInitiatorAvatarUrl(row?.avatar_url ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View
      className="bg-primary-day dark:bg-primary-night rounded-2xl p-4"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      }}
    >
      <View className="flex-row gap-3">
        <Avatar
          alt={initiatorName}
          className="bg-transparent-day dark:bg-transparent-night size-14"
        >
          {initiatorAvatarUrl ? (
            <Avatar.Image
              source={{
                uri: getAvatarUrl(initiatorAvatarUrl) ?? undefined,
              }}
            />
          ) : null}
          <Avatar.Fallback color="accent">
            <User width={24} height={24} color="#A0A0A0" />
          </Avatar.Fallback>
        </Avatar>

        <View className="min-w-0 flex-1 justify-center">
          <View className="flex-row items-center">
            <View className="grow">
              <Text className="text-text-day dark:text-text-night text-base font-semibold">
                {initiatorName}{" "}
                <Text className="text-hint font-normal">
                  wants to join you.
                </Text>
              </Text>
            </View>
            <View className="bg-main ml-2 size-2.5 rounded-full" />
          </View>

          <Text className="text-hint mt-1 text-sm">
            {format(notification?.created_at ?? "", "MMMM d, yyyy")}
          </Text>

          <View className="mt-3 flex-row gap-3">
            <TouchableOpacity className="items-center justify-center rounded-xl bg-[#72D000] px-4 py-1 active:opacity-90">
              <Text className="text-sm font-semibold text-white">Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-transparent-day dark:bg-transparent-night items-center justify-center rounded-xl border border-[#E5E5EA] px-4 py-1 active:opacity-90 dark:border-[#444444]">
              <Text className="text-text-day dark:text-text-night text-sm font-semibold">
                Decline
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default InviteNotification;

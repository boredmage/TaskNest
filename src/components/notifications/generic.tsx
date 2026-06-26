import { supabase } from "@/lib/supabase";
import { getAvatarUrl } from "@/lib/util";
import { AppNotification } from "@/stores/notifications-store";
import { format } from "date-fns";
import { Avatar } from "heroui-native";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import User from "../icons/user";

/**
 * Fallback renderer for informational notifications that don't require an
 * action (join request approved, invite accepted, todo assigned/completed/
 * overdue, family archived). Shows the title, body and date.
 */
const GenericNotification = ({
  notification,
}: {
  notification: AppNotification;
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const initiatorId = notification?.initiator_id;
    if (!initiatorId) return;

    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", initiatorId)
        .maybeSingle();

      if (cancelled) return;
      const row = data as { avatar_url?: string | null } | null;
      setAvatarUrl(row?.avatar_url ?? null);
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
          alt={notification.title ?? "Notification"}
          className="bg-transparent-day dark:bg-transparent-night size-14"
        >
          {avatarUrl ? (
            <Avatar.Image
              source={{ uri: getAvatarUrl(avatarUrl) ?? undefined }}
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
                {notification.title ?? "Notification"}
              </Text>
            </View>
            {notification.read_at ? null : (
              <View className="bg-main ml-2 size-2.5 rounded-full" />
            )}
          </View>

          {notification.body ? (
            <Text className="text-hint mt-0.5 text-sm">
              {notification.body}
            </Text>
          ) : null}

          <Text className="text-hint mt-1 text-sm">
            {format(notification?.created_at ?? "", "MMMM d, yyyy")}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default GenericNotification;

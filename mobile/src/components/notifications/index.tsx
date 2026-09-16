import { CachedAvatarImage } from "@/components/cached-avatar-image";
import ChevronRight from "@/components/icons/chevron-right";
import User from "@/components/icons/user";
import { api, errorMessage } from "@/lib/api";
import { formatDayAndTime } from "@/lib/dates";
import { getAvatarUrl } from "@/lib/util";
import { useFamilyStore } from "@/stores/family-store";
import {
  AppNotification,
  NotificationType,
  useNotificationsStore,
} from "@/stores/notifications-store";
import { useTodosStore } from "@/stores/todos-store";
import { useRouter } from "expo-router";
import { Avatar } from "heroui-native";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

type Initiator = { full_name: string | null; avatar_url: string | null };

// One profile fetch per initiator, shared by every card on the screen.
const initiatorCache = new Map<string, Promise<Initiator | null>>();

function useInitiator(id: string | null) {
  const member = useFamilyStore((s) =>
    id ? s.members.find((m) => m.user_id === id) : undefined
  );
  const [profile, setProfile] = useState<Initiator | null>(null);

  useEffect(() => {
    if (!id || member) return;
    let cancelled = false;
    let pending = initiatorCache.get(id);
    if (!pending) {
      pending = api.get<Initiator>(`/profiles/${id}`).catch(() => null);
      initiatorCache.set(id, pending);
    }
    pending.then((row) => {
      if (!cancelled) setProfile(row);
    });
    return () => {
      cancelled = true;
    };
  }, [id, member]);

  if (member) return { name: member.name, avatarUrl: member.avatar_url };
  return {
    name: profile?.full_name?.trim() || "Someone",
    avatarUrl: profile?.avatar_url ?? null,
  };
}

const Strong = ({ children }: { children: React.ReactNode }) => (
  <Text className="text-text-day dark:text-text-night font-semibold">
    {children}
  </Text>
);

/** Task-title / message box under the headline. */
const DetailBox = ({ text }: { text: string }) => (
  <View className="bg-transparent-day dark:bg-transparent-night self-start rounded-lg px-3 py-2">
    <Text
      className="text-text-day dark:text-text-night text-sm leading-5 font-medium"
      numberOfLines={2}
    >
      {text}
    </Text>
  </View>
);

/** One News-tab card (Figma 205:6233 / 205:6234). */
const Notification = ({ notification }: { notification: AppNotification }) => {
  const router = useRouter();
  const { patchNotificationData } = useNotificationsStore();
  const { name, avatarUrl } = useInitiator(notification.initiator_id);
  const todoId: string | undefined = notification.raw?.data?.todo_id;
  const todoTitle = useTodosStore((s) =>
    todoId ? s.todos.find((t) => t.id === todoId)?.title : undefined
  );

  // Task notifications open the task; tapping also marks them read.
  const openTask = todoId
    ? () => {
        if (!notification.read_at) patchNotificationData(notification.id, {});
        router.push({ pathname: "/task/[id]", params: { id: todoId } });
      }
    : undefined;
  const { day, time } = formatDayAndTime(notification.created_at);
  // Server bodies quote the task title, e.g. `Alice assigned you "Buy milk".`
  const quoted = notification.body?.match(/"([^"]+)"/)?.[1];
  const taskLabel = todoTitle ?? quoted ?? notification.body;

  let head: React.ReactNode;
  let detail: React.ReactNode = null;
  const box = (text: string | null) =>
    text ? <DetailBox text={text} /> : null;

  switch (notification.type) {
    case NotificationType.TODO_ASSIGNED:
      head = (
        <>
          <Strong>{name}</Strong> assigned a task to <Strong>you</Strong>
        </>
      );
      detail = box(taskLabel);
      break;
    case NotificationType.TODO_COMPLETED:
      head = (
        <>
          <Strong>{name}</Strong> completed a task
        </>
      );
      detail = box(taskLabel);
      break;
    case NotificationType.TODO_OVERDUE:
      head = <Strong>Task overdue</Strong>;
      detail = box(taskLabel);
      break;
    case NotificationType.TODO_REMINDER:
      head = (
        <>
          <Strong>Due soon</Strong>
          {notification.body?.match(/is due (.+)\.$/)?.[1]
            ? ` · ${notification.body.match(/is due (.+)\.$/)![1]}`
            : ""}
        </>
      );
      detail = box(taskLabel);
      break;
    case NotificationType.JOIN_REQUEST_RECEIVED:
      head = (
        <>
          <Strong>{name}</Strong> wants to join you
        </>
      );
      detail = <JoinRequestActions notification={notification} />;
      break;
    case NotificationType.FAMILY_INVITE_RECEIVED:
      head = (
        <>
          <Strong>{name}</Strong> invited you to their family
        </>
      );
      detail = <FamilyInviteActions notification={notification} />;
      break;
    case NotificationType.JOIN_REQUEST_APPROVED:
      head = (
        <>
          <Strong>{name}</Strong> approved your request
        </>
      );
      detail = box("Welcome to the family!");
      break;
    case NotificationType.FAMILY_INVITE_ACCEPTED:
      head = (
        <>
          <Strong>{name}</Strong> joined your family
        </>
      );
      break;
    default:
      head = <Strong>{notification.title ?? "Notification"}</Strong>;
      detail = box(notification.body);
  }

  return (
    <Pressable
      onPress={openTask}
      disabled={!openTask}
      className="bg-primary-day dark:bg-primary-night flex-row gap-3 rounded-2xl px-4 py-3 active:opacity-90"
    >
      <Avatar
        alt={name}
        className="bg-transparent-day dark:bg-transparent-night size-10 rounded-full"
      >
        {avatarUrl ? (
          <CachedAvatarImage uri={getAvatarUrl(avatarUrl) ?? undefined} />
        ) : null}
        <Avatar.Fallback className="bg-transparent-day dark:bg-transparent-night size-10 items-center justify-center rounded-full">
          <User width={18} height={18} color="#A0A0A0" />
        </Avatar.Fallback>
      </Avatar>

      <View className="min-w-0 flex-1">
        <View className="flex-row items-start gap-2">
          <Text className="text-hint flex-1 text-sm leading-5">{head}</Text>
          {notification.read_at ? null : (
            <View className="bg-main mt-1.5 size-2 rounded-full" />
          )}
          {openTask ? (
            <View className="mt-1.5">
              <ChevronRight width={6} height={10} />
            </View>
          ) : null}
        </View>
        <Text className="text-hint mt-0.5 text-xs">
          {day} · {time}
        </Text>
        {detail ? <View className="mt-2.5">{detail}</View> : null}
      </View>
    </Pressable>
  );
};

export default Notification;

// ---------------------------------------------------------------------------
// Action rows
// ---------------------------------------------------------------------------
function ActionButtons({
  busy,
  onAccept,
  onDecline,
}: {
  busy: "accept" | "decline" | null;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <View className="flex-row gap-2">
      <Pressable
        className="bg-main h-8 items-center justify-center rounded-lg px-4 active:opacity-80"
        onPress={onAccept}
        disabled={busy !== null}
      >
        <Text className="text-[13px] font-semibold text-white">
          {busy === "accept" ? "..." : "Accept"}
        </Text>
      </Pressable>
      <Pressable
        className="bg-transparent-day dark:bg-transparent-night h-8 items-center justify-center rounded-lg px-4 active:opacity-80"
        onPress={onDecline}
        disabled={busy !== null}
      >
        <Text className="text-text-day dark:text-text-night text-[13px] font-medium">
          {busy === "decline" ? "..." : "Decline"}
        </Text>
      </Pressable>
    </View>
  );
}

function Outcome({ text }: { text: string }) {
  return <Text className="text-hint text-[13px]">{text}</Text>;
}

/** Owner/admin side of "X wants to join you". */
function JoinRequestActions({
  notification,
}: {
  notification: AppNotification;
}) {
  const [busy, setBusy] = useState<"accept" | "decline" | null>(null);
  const { fetchFamily } = useFamilyStore();
  const { patchNotificationData } = useNotificationsStore();
  const requestId = notification.raw?.data?.request_id;
  const data = notification.raw?.data ?? {};

  if (data.approved) return <Outcome text="You accepted this request." />;
  if (data.declined) return <Outcome text="You declined this request." />;

  const respond = async (accept: boolean) => {
    if (busy || !requestId) return;
    setBusy(accept ? "accept" : "decline");
    try {
      await api.post(
        `/families/join-requests/${requestId}/${accept ? "approve" : "decline"}`
      );
      await patchNotificationData(
        notification.id,
        accept ? { approved: true } : { declined: true }
      );
      if (accept) {
        fetchFamily({ silent: true });
        useTodosStore.getState().fetchTodos();
      }
    } catch (error) {
      Alert.alert(
        accept ? "Could not accept" : "Could not decline",
        errorMessage(error)
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <ActionButtons
      busy={busy}
      onAccept={() => respond(true)}
      onDecline={() => respond(false)}
    />
  );
}

/** Invitee side of "X invited you to their family". */
function FamilyInviteActions({
  notification,
}: {
  notification: AppNotification;
}) {
  const [busy, setBusy] = useState<"accept" | "decline" | null>(null);
  const { fetchFamily } = useFamilyStore();
  const { patchNotificationData } = useNotificationsStore();
  const inviteId = notification.raw?.data?.invite_id;
  const data = notification.raw?.data ?? {};

  if (data.responded) {
    return (
      <Outcome
        text={
          data.accepted
            ? "You joined this family."
            : "You declined this invitation."
        }
      />
    );
  }

  const respond = async (accept: boolean) => {
    if (busy || !inviteId) return;
    setBusy(accept ? "accept" : "decline");
    try {
      await api.post(`/families/invites/${inviteId}/respond`, { accept });
      await patchNotificationData(notification.id, {
        responded: true,
        accepted: accept,
      });
      if (accept) {
        fetchFamily({ silent: true });
        useTodosStore.getState().fetchTodos();
      }
    } catch (error) {
      Alert.alert("Something went wrong", errorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  return (
    <ActionButtons
      busy={busy}
      onAccept={() => respond(true)}
      onDecline={() => respond(false)}
    />
  );
}

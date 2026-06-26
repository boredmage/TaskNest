import { CustomSwitch } from "@/components/custom-switch";
import WithArrowBack from "@/layout/with-arrow-back";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

type NotificationKey =
  | "newTaskAssigned"
  | "taskCompleted"
  | "taskReminder"
  | "familyMemberJoined"
  | "taskOverdue";

type NotificationSettings = Record<NotificationKey, boolean>;

const DEFAULT_SETTINGS: NotificationSettings = {
  newTaskAssigned: true,
  taskCompleted: true,
  taskReminder: true,
  familyMemberJoined: true,
  taskOverdue: true,
};

type NotificationRowProps = {
  title: string;
  description: string;
  value: boolean;
  onChange: () => void;
};

const NotificationRow = ({
  title,
  description,
  value,
  onChange,
}: NotificationRowProps) => {
  return (
    <View>
      <View className="bg-primary-day dark:bg-primary-night rounded-xl px-4 py-3">
        <View className="flex-row items-center">
          <Text className="text-text-day dark:text-text-night flex-1 text-base">
            {title}
          </Text>
          <CustomSwitch value={value} onValueChange={onChange} size="medium" />
        </View>
      </View>
      <Text className="text-hint mt-1 px-1 text-xs">{description}</Text>
    </View>
  );
};

const Notifications = () => {
  const [settings, setSettings] =
    useState<NotificationSettings>(DEFAULT_SETTINGS);
  const { t } = useTranslation();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("notification_preferences")
        .select("preferences")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;
      if (error) {
        console.error("[NOTIF PREFS] load error:", error);
        return;
      }
      if (data?.preferences) {
        setSettings((prev) => ({
          ...prev,
          ...(data.preferences as Partial<NotificationSettings>),
        }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = async (next: NotificationSettings) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("notification_preferences")
      .upsert(
        { user_id: user.id, preferences: next },
        { onConflict: "user_id" }
      );

    if (error) {
      console.error("[NOTIF PREFS] save error:", error);
    }
  };

  const toggle = (key: NotificationKey) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      persist(next);
      return next;
    });
  };

  return (
    <WithArrowBack title={t("settings.notifications")}>
      <View className="mt-10 flex-1">
        <View className="gap-6">
          <NotificationRow
            title="New Task Assigned"
            description="Get notified when someone assigns a task to you."
            value={settings.newTaskAssigned}
            onChange={() => toggle("newTaskAssigned")}
          />
          <NotificationRow
            title="Task Completed"
            description="Know when a family member finishes a task."
            value={settings.taskCompleted}
            onChange={() => toggle("taskCompleted")}
          />
          <NotificationRow
            title="Task Reminder"
            description="Receive reminders before task deadlines."
            value={settings.taskReminder}
            onChange={() => toggle("taskReminder")}
          />
          <NotificationRow
            title="Family Member Joined"
            description="Be informed of changes to your family settings or name."
            value={settings.familyMemberJoined}
            onChange={() => toggle("familyMemberJoined")}
          />
          <NotificationRow
            title="Task Overdue"
            description="We'll remind you if a task you're assigned to is overdue."
            value={settings.taskOverdue}
            onChange={() => toggle("taskOverdue")}
          />
        </View>
      </View>
    </WithArrowBack>
  );
};

export default Notifications;

import { CustomSwitch } from "@/components/custom-switch";
import WithArrowBack from "@/layout/with-arrow-back";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

type NotificationKey =
  | "newTaskAssigned"
  | "taskCompleted"
  | "taskReminder"
  | "familyMemberJoined"
  | "taskOverdue";

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
  const [settings, setSettings] = useState({
    newTaskAssigned: true,
    taskCompleted: true,
    taskReminder: true,
    familyMemberJoined: true,
    taskOverdue: true,
  });
  const { t } = useTranslation();

  const toggle = (key: NotificationKey) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
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

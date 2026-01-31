import { View, Text } from "react-native";
import { useState } from "react";
import { Switch } from "heroui-native";
import WithArrowBack from "@/layout/with-arrow-back";
import { useTranslation } from "react-i18next";

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
  highlightThumb?: boolean;
};

const NotificationRow = ({
  title,
  description,
  value,
  onChange,
  highlightThumb,
}: NotificationRowProps) => {
  return (
    <View>
      <View className="bg-white rounded-xl px-4 py-3">
        <View className="flex-row items-center">
          <Text className="flex-1 text-base text-black">
            {title}
          </Text>
        <Switch className="w-[48px] h-[28px]" isSelected={value}
            animation={{
              backgroundColor: {
                value: ['#E5E5E5', '#72D000'],
              },
            }}
            onSelectedChange={onChange}>
          <Switch.Thumb className="size-5 bg-white rounded-full" animation={{
              left: {
              value: 3,
                springConfig: {
                  damping: 30,
                  stiffness: 300,
                  mass: 1,
                },
              },
            }} />
          </Switch>
        </View>
      </View>
      <Text className="mt-1 text-xs text-hint-day px-1">{description}</Text>
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
      <View className="flex-1 bg-[#F2F2F2] mt-10">
        <View className="gap-6">
          <NotificationRow
            title="New Task Assigned"
            description="Get notified when someone assigns a task to you."
            value={settings.newTaskAssigned}
            onChange={() => toggle("newTaskAssigned")}
            highlightThumb
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

export default Notifications
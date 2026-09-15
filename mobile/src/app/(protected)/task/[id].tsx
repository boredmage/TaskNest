import {
  archiveBox,
  calendar,
  dotsVertical,
  edit,
  share,
  tabFile,
  trash,
} from "@/assets/icons";
import { CustomButton } from "@/components/custom-button";
import { EmptyState } from "@/components/empty-state";
import BellIcon from "@/components/icons/bell";
import RepeatIcon from "@/components/icons/repeat";
import User from "@/components/icons/user";
import { PopoverMenu, type PopoverMenuItem } from "@/components/popover-menu";
import { STATUS_COLORS } from "@/components/stats-card";
import { SvgIcon } from "@/components/svg-icon";
import { useAppTheme } from "@/contexts/app-theme-context";
import WithArrowBack from "@/layout/with-arrow-back";
import { CATEGORIES, categoryLabel } from "@/lib/categories";
import { formatDueLabel, formatPostedLabel } from "@/lib/dates";
import {
  PRIORITY_COLORS,
  priorityLabel,
  reminderLabel,
  repeatLabel,
} from "@/lib/todo-options";
import { getAvatarUrl } from "@/lib/util";
import { useFamilyStore } from "@/stores/family-store";
import { useProfileStore } from "@/stores/profile-store";
import { useTodosStore, type TodoStatus } from "@/stores/todos-store";
import { StatusEnum } from "@/type";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Avatar, cn } from "heroui-native";
import { useState, type ReactNode } from "react";
import { Alert, Pressable, ScrollView, Share, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STATUS_META: Record<TodoStatus, { label: string; color: string }> = {
  in_progress: { label: "To do", color: STATUS_COLORS[StatusEnum.TODO] },
  completed: { label: "Completed", color: STATUS_COLORS[StatusEnum.COMPLETED] },
  overdue: { label: "Overdue", color: STATUS_COLORS[StatusEnum.OVERDUE] },
  archived: { label: "Archived", color: "#A0A0A0" },
};

const DUE_COLOR = "#04A7FF";
const REPEAT_COLOR = "#A06CFF";
const REMINDER_COLOR = "#FFAF3F";

/** Small tinted status / priority tag. */
function Chip({ label, color }: { label: string; color: string }) {
  return (
    <View
      className="rounded-md px-2 py-1"
      style={{ backgroundColor: `${color}1F` }}
    >
      <Text className="text-xs font-semibold" style={{ color }}>
        {label}
      </Text>
    </View>
  );
}

/** A card with a small caption above it. */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-1.5">
      <Text className="text-hint ml-1 text-xs font-semibold tracking-wide uppercase">
        {title}
      </Text>
      <View className="bg-primary-day dark:bg-primary-night overflow-hidden rounded-2xl">
        {children}
      </View>
    </View>
  );
}

/** Icon tile + label on the left, value on the right. */
function DetailRow({
  icon,
  tint,
  label,
  value,
  valueColor,
  last,
}: {
  icon: ReactNode;
  tint: string;
  label: string;
  value: string;
  valueColor?: string;
  last?: boolean;
}) {
  return (
    <View
      className={cn(
        "flex-row items-center gap-3 px-4 py-3",
        !last && "border-transparent-day dark:border-transparent-night border-b"
      )}
    >
      <View
        className="size-8 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${tint}1F` }}
      >
        {icon}
      </View>
      <Text className="text-hint flex-1 text-sm">{label}</Text>
      <Text
        className="text-text-day dark:text-text-night text-sm font-medium"
        style={valueColor ? { color: valueColor } : undefined}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

/** Task detail (Figma 205:6414) with the kebab menu (205:6431). */
const TaskDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();
  const todo = useTodosStore((s) => s.todos.find((t) => t.id === id));
  const { archiveTodo, deleteTodo, setStatus, toggleComplete } =
    useTodosStore();
  const { members } = useFamilyStore();
  const profile = useProfileStore((s) => s.profile);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toggling, setToggling] = useState(false);

  if (!todo) {
    return (
      <WithArrowBack>
        <EmptyState
          title="Task not found"
          body="This task may have been deleted by a family member."
        />
      </WithArrowBack>
    );
  }

  const myId = profile?.id;
  const iconColor = isDark ? "#FFFFFF" : "#1B1B1B";
  const status = STATUS_META[todo.status];
  const priorityColor = PRIORITY_COLORS[todo.priority];
  const completed = todo.status === "completed";
  const overdue = todo.status === "overdue";
  const archived = todo.status === "archived";

  const category = CATEGORIES.find((c) => c.id === todo.category);
  const CategoryIcon = category?.Icon;

  // Resolve assignees to people; the creator can be assigned on a personal
  // task with no family, so fall back to the signed-in profile for "you".
  const assignees = (todo.assignee_ids ?? []).flatMap((uid) => {
    const member = members.find((m) => m.user_id === uid);
    if (member) {
      return [
        {
          id: uid,
          name: uid === myId ? `${member.name} (you)` : member.name,
          avatar: member.avatar_url ? getAvatarUrl(member.avatar_url) : null,
        },
      ];
    }
    if (uid === myId) {
      return [
        {
          id: uid,
          name: profile?.full_name ? `${profile.full_name} (you)` : "You",
          avatar: profile?.avatar_url ? getAvatarUrl(profile.avatar_url) : null,
        },
      ];
    }
    return [];
  });

  const posterName =
    todo.owner_id === myId
      ? "you"
      : (members.find((m) => m.user_id === todo.owner_id)?.name ?? "a member");

  const onToggleComplete = async () => {
    setToggling(true);
    const { error } = await toggleComplete(todo.id, !completed);
    setToggling(false);
    if (error) Alert.alert("Could not update task");
  };

  const menu: PopoverMenuItem[] = [
    {
      label: "Share",
      icon: <SvgIcon art={share} size={20} color={iconColor} />,
      onPress: () =>
        Share.share({
          message: [todo.title, todo.description].filter(Boolean).join("\n"),
        }).catch(() => {}),
    },
    {
      label: "Edit",
      icon: <SvgIcon art={edit} size={20} color={iconColor} />,
      onPress: () =>
        router.push({ pathname: "/new-task", params: { id: todo.id } }),
    },
    {
      label: archived ? "Remove from archive" : "Add to archive",
      icon: <SvgIcon art={archiveBox} size={20} color={iconColor} />,
      onPress: () =>
        archived ? setStatus(todo.id, "in_progress") : archiveTodo(todo.id),
    },
    {
      label: "Delete",
      destructive: true,
      icon: <SvgIcon art={trash} size={20} />,
      onPress: () =>
        Alert.alert(
          "Delete task",
          `Delete "${todo.title}"? This can't be undone.`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: async () => {
                const { error } = await deleteTodo(todo.id);
                if (error) Alert.alert("Could not delete task");
                else router.back();
              },
            },
          ]
        ),
    },
  ];

  return (
    <WithArrowBack
      right={
        <Pressable onPress={() => setMenuOpen(true)} hitSlop={12}>
          <SvgIcon art={dotsVertical} size={24} color={iconColor} />
        </Pressable>
      }
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 pt-2 pb-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero: status, priority, title, description, category */}
        <View className="bg-primary-day dark:bg-primary-night gap-3 rounded-2xl p-4">
          <View className="flex-row items-center justify-between">
            <Chip label={status.label} color={status.color} />
            <Chip
              label={`${priorityLabel(todo.priority)} priority`}
              color={priorityColor}
            />
          </View>

          <View className="gap-1.5">
            <Text
              className={cn(
                "text-text-day dark:text-text-night text-[22px] leading-7 font-semibold",
                completed && "line-through opacity-60"
              )}
            >
              {todo.title}
            </Text>
            {todo.description ? (
              <Text className="text-hint text-[15px] leading-[22px]">
                {todo.description}
              </Text>
            ) : null}
          </View>

          <View className="flex-row items-center gap-2">
            <View
              className="bg-transparent-day dark:bg-transparent-night size-7 items-center justify-center rounded-full"
              style={category ? { backgroundColor: category.tint } : undefined}
            >
              {CategoryIcon ? (
                <CategoryIcon width={14} height={14} />
              ) : (
                <SvgIcon art={tabFile} size={13} color="#A0A0A0" />
              )}
            </View>
            <Text className="text-hint text-[13px] font-medium">
              {categoryLabel(todo.category) || "Other"}
            </Text>
          </View>
        </View>

        <Section title="Details">
          <DetailRow
            icon={
              <SvgIcon
                art={calendar}
                size={16}
                color={overdue ? status.color : DUE_COLOR}
              />
            }
            tint={overdue ? status.color : DUE_COLOR}
            label="Due"
            value={
              todo.due_date ? formatDueLabel(todo.due_date) : "No due date"
            }
            valueColor={overdue ? status.color : undefined}
          />
          <DetailRow
            icon={<RepeatIcon width={16} height={16} color={REPEAT_COLOR} />}
            tint={REPEAT_COLOR}
            label="Repeat"
            value={repeatLabel(todo.repeat)}
          />
          <DetailRow
            icon={<BellIcon width={16} height={16} color={REMINDER_COLOR} />}
            tint={REMINDER_COLOR}
            label="Reminder"
            value={reminderLabel(todo.reminder_minutes)}
            last
          />
        </Section>

        <Section title="Assigned to">
          {assignees.length ? (
            assignees.map((person, index) => (
              <View
                key={person.id}
                className={cn(
                  "flex-row items-center gap-3 px-4 py-2.5",
                  index < assignees.length - 1 &&
                    "border-transparent-day dark:border-transparent-night border-b"
                )}
              >
                <Avatar alt={person.name} className="size-8 rounded-full">
                  {person.avatar ? (
                    <Avatar.Image source={{ uri: person.avatar }} />
                  ) : null}
                  <Avatar.Fallback className="size-8 items-center justify-center rounded-full bg-[#E5E5EA] dark:bg-[#3A3A3C]">
                    <User width={16} height={16} color="#A0A0A0" />
                  </Avatar.Fallback>
                </Avatar>
                <Text
                  className="text-text-day dark:text-text-night flex-1 text-sm font-medium"
                  numberOfLines={1}
                >
                  {person.name}
                </Text>
              </View>
            ))
          ) : (
            <View className="flex-row items-center gap-3 px-4 py-2.5">
              <View className="bg-transparent-day dark:bg-transparent-night size-8 items-center justify-center rounded-full">
                <User width={16} height={16} color="#A0A0A0" />
              </View>
              <Text className="text-hint text-sm">Unassigned</Text>
            </View>
          )}
        </Section>

        <Text className="text-hint text-center text-xs">
          Created {formatPostedLabel(todo.created_at)} by {posterName}
        </Text>
      </ScrollView>

      {!archived ? (
        <View className="pt-2 pb-2">
          <CustomButton
            className="h-[50px]"
            intent={completed ? "secondary" : "primary"}
            isDisabled={toggling}
            onPress={onToggleComplete}
          >
            {completed ? "Mark as not done" : "Mark as done"}
          </CustomButton>
        </View>
      ) : null}

      <PopoverMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={menu}
        top={insets.top + 52}
      />
    </WithArrowBack>
  );
};

export default TaskDetail;

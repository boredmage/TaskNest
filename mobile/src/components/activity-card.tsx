import Check from "@/components/icons/check";
import { useAppTheme } from "@/contexts/app-theme-context";
import { StatusEnum } from "@/type";
import { Avatar, Checkbox, cn } from "heroui-native";
import { useEffect, useState } from "react";
import { LayoutChangeEvent, Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function parseDateTime(dateTime: string): Date | null {
  const iso = dateTime.includes("T") || dateTime.includes(" ");
  if (iso) {
    const d = new Date(dateTime);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const parts = dateTime.trim().split("-").map(Number);
  if (parts.length >= 3 && parts.every((n) => !Number.isNaN(n))) {
    return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
  }
  const d = new Date(dateTime);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDateLabel(dateTime?: string): string {
  if (!dateTime) return "";
  const d = parseDateTime(dateTime);
  if (!d) return dateTime;

  const today = new Date();
  const toMidnight = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = toMidnight(d);
  const todayMidnight = toMidnight(today);

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  const diffDays = Math.round(
    (day.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return `Today · ${timeStr}`;
  if (diffDays === -1) return `Yesterday · ${timeStr}`;
  if (diffDays === 1) return `Tomorrow · ${timeStr}`;
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()} · ${timeStr}`;
}

export type ActivityCardProps = {
  title?: string;
  description?: string;
  dueDate?: string;
  assignedAvatarUris?: string[];
  assignedNames?: string[];
  status?: StatusEnum;
  onToggleComplete?: () => void;
  onPress?: () => void;
  onLongPress?: () => void;
};

export function ActivityCard({
  title,
  description,
  dueDate,
  assignedAvatarUris,
  status = StatusEnum.TODO,
  onToggleComplete,
  onPress,
  onLongPress,
}: ActivityCardProps) {
  const { isDark } = useAppTheme();
  const [isCompleted, setIsCompleted] = useState(
    status === StatusEnum.COMPLETED
  );
  const [titleLayout, setTitleLayout] = useState({ width: 0, height: 0 });
  const strikeProgress = useSharedValue(0);

  // Keep local completion state in sync with the store-driven status prop so
  // out-of-band changes (other screens, pull-to-refresh, another member) don't
  // leave a stale checkbox that inverts the next toggle.
  useEffect(() => {
    setIsCompleted(status === StatusEnum.COMPLETED);
  }, [status]);

  useEffect(() => {
    strikeProgress.value = withTiming(isCompleted ? 1 : 0, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [isCompleted]);

  const strikeAnimatedStyle = useAnimatedStyle(() => ({
    width: titleLayout.width * strikeProgress.value,
  }));

  const handleToggle = () => {
    setIsCompleted((prev) => !prev);
    onToggleComplete?.();
  };

  const onTitleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setTitleLayout({ width, height });
  };

  const strikeLineTop = titleLayout.height > 0 ? titleLayout.height / 2 : 10;

  const overdue = status === StatusEnum.OVERDUE;
  const due = formatDateLabel(dueDate);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      className="bg-primary-day dark:bg-primary-night rounded-2xl px-4 py-3.5 active:opacity-95"
    >
      {/* Title row: title on the left, quick-complete on the right */}
      <View className="flex-row items-center gap-3">
        {/* Outer view takes the row width; inner view hugs the text so the
            strike line is measured against the title, not the row. */}
        <View className="min-w-0 flex-1">
          <View onLayout={onTitleLayout} className="relative self-start">
            <Text
              className={cn(
                "text-text-day dark:text-text-night text-base leading-[22px] font-semibold",
                isCompleted && "opacity-60"
              )}
              numberOfLines={1}
            >
              {title}
            </Text>
            <Animated.View
              pointerEvents="none"
              style={[
                strikeAnimatedStyle,
                {
                  position: "absolute",
                  left: 0,
                  top: strikeLineTop,
                  height: 1.5,
                  backgroundColor: isDark ? "#FFFFFF" : "#1B1B1B",
                  opacity: 0.6,
                  borderRadius: 1,
                },
              ]}
            />
          </View>
        </View>
        <Checkbox
          isSelected={isCompleted}
          variant="secondary"
          onSelectedChange={handleToggle}
          hitSlop={8}
          className={cn(
            "size-6 rounded-full border-2 shadow-none",
            isCompleted
              ? "bg-main border-main"
              : "bg-primary-day dark:bg-primary-night border-[#C9C9C9] dark:border-[#5A5A5A]"
          )}
        >
          <Checkbox.Indicator className="bg-transparent">
            <Check fill="#ffffff" width={14} height={14} />
          </Checkbox.Indicator>
        </Checkbox>
      </View>

      {description ? (
        <Text className="text-hint mt-1 text-sm leading-5" numberOfLines={2}>
          {description}
        </Text>
      ) : null}

      {due || assignedAvatarUris?.length ? (
        <View className="mt-2.5 flex-row items-center justify-between gap-3">
          {due ? (
            <View
              className="rounded-sm px-2 py-[3px]"
              style={{
                backgroundColor: overdue
                  ? "rgba(255,19,19,0.1)"
                  : "rgba(4,167,255,0.1)",
              }}
            >
              <Text
                className="text-xs leading-4 font-medium"
                style={{ color: overdue ? "#FF1313" : "#04A7FF" }}
              >
                {due}
              </Text>
            </View>
          ) : (
            <View />
          )}
          <View className="flex-row items-center">
            {assignedAvatarUris?.slice(0, 3).map((uri, index) => (
              <Avatar
                key={`${uri}-${index}`}
                alt={`Assignee ${index + 1}`}
                className={cn(
                  "border-primary-day dark:border-primary-night size-6 rounded-full border-2",
                  index === 0 ? "ml-0" : "-ml-2"
                )}
              >
                <Avatar.Image source={{ uri }} />
                <Avatar.Fallback className="size-6 rounded-full bg-[#E5E5EA] dark:bg-[#3A3A3C]" />
              </Avatar>
            ))}
          </View>
        </View>
      ) : null}
    </Pressable>
  );
}

export default ActivityCard;

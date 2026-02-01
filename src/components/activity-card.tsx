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
  const hour12 = d.getHours() % 12 || 12;
  const ampm = d.getHours() < 12 ? "am" : "pm";
  const timeStr = `${hour12}:${pad(d.getMinutes())} ${ampm}`;

  const diffDays = Math.round(
    (day.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return `Today – ${timeStr}`;
  if (diffDays === -1) return `Yesterday – ${timeStr}`;
  if (diffDays === 1) return `Tomorrow – ${timeStr}`;
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${timeStr}`;
}

export type ActivityCardProps = {
  title?: string;
  description?: string;
  dateTime?: string;
  assignedAvatarUris?: string[];
  status?: StatusEnum;
  onToggleComplete?: () => void;
  onPress?: () => void;
};

export function ActivityCard({
  title,
  description,
  dateTime,
  assignedAvatarUris,
  status = StatusEnum.TODO,
  onToggleComplete,
  onPress,
}: ActivityCardProps) {
  const { isDark } = useAppTheme();
  const [isCompleted, setIsCompleted] = useState(
    status === StatusEnum.COMPLETED
  );
  const [titleLayout, setTitleLayout] = useState({ width: 0, height: 0 });
  const strikeProgress = useSharedValue(0);

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

  return (
    <Pressable
      onPress={onPress}
      className="bg-primary-day dark:bg-primary-night rounded-2xl p-4 active:opacity-95"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      }}
    >
      <View className="flex-row items-center gap-3">
        <View className="min-w-0 flex-1">
          <View
            onLayout={onTitleLayout}
            className="relative"
            style={{ alignSelf: "flex-start" }}
          >
            <Text
              className={cn(
                "text-text-day dark:text-text-night text-base font-semibold",
                status === StatusEnum.OVERDUE &&
                  "text-[#FF5050] dark:text-[#FF5050]"
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
                  backgroundColor:
                    status === StatusEnum.OVERDUE
                      ? "#FF5050"
                      : isDark
                        ? "#FFFFFF"
                        : "#000",
                  borderRadius: 1,
                },
              ]}
            />
          </View>
          <Text
            className={cn(
              "text-hint mt-1 text-base leading-5",
              status === StatusEnum.OVERDUE && "text-[#FF5050]"
            )}
            numberOfLines={3}
          >
            {description}
          </Text>
        </View>
        <Checkbox
          isSelected={isCompleted}
          variant="secondary"
          onSelectedChange={handleToggle}
          className={cn(
            "size-6 rounded-full border-2 shadow-none",
            isCompleted
              ? "bg-main border-main"
              : "bg-primary-day dark:bg-primary-night border-transparent-day dark:border-transparent-night"
          )}
        >
          <Checkbox.Indicator className="bg-transparent" />
        </Checkbox>
      </View>

      <View className="bg-transparent-day dark:bg-transparent-night my-3 h-px" />

      <View className="flex-row items-center justify-between">
        <Text
          className={cn(
            "text-hint text-base",
            status === StatusEnum.OVERDUE &&
              "text-[#FF5050] dark:text-[#FF5050]"
          )}
        >
          {formatDateLabel(dateTime)}
        </Text>
        <View className="flex-row items-center">
          {assignedAvatarUris?.slice(0, 3).map((uri, index) => (
            <Avatar
              key={`${uri}-${index}`}
              alt={`Assignee ${index + 1}`}
              className={cn(
                "border-background-day dark:border-background-night h-8 w-8 rounded-full border-2",
                index === 0 ? "ml-0" : "-ml-4"
              )}
            >
              <Avatar.Image source={{ uri }} />
              <Avatar.Fallback className="h-8 w-8 rounded-full bg-[#E5E5EA]" />
            </Avatar>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

export default ActivityCard;

import ChevronRight from "@/components/icons/chevron-right";
import { useAppTheme } from "@/contexts/app-theme-context";
import { StatusEnum } from "@/type";
import { Avatar, cn } from "heroui-native";
import { Pressable, Text, View } from "react-native";
import { ActivityCardProps } from "./activity-card";

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function parseDateTime(dateTime?: string): Date | null {
  if (!dateTime) return null;
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

function formatDueDatePill(dateTime?: string): string {
  if (!dateTime) return "";
  const d = parseDateTime(dateTime);
  if (!d) return dateTime;

  const today = new Date();
  const toMidnight = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = toMidnight(d);
  const todayMidnight = toMidnight(today);

  const diffDays = Math.round(
    (day.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24)
  );
  const weekday = WEEKDAY_NAMES[d.getDay()];

  if (diffDays === 0) return `${weekday} Today`;
  if (diffDays === 1) return `${weekday} Tomorrow`;
  if (diffDays === -1) return `${weekday} Yesterday`;
  const count = Math.abs(diffDays);
  const suffix = diffDays > 0 ? "remaining" : "ago";
  const daysLabel = count === 1 ? "day" : "days";
  return `${weekday} ${count} ${daysLabel} ${suffix}`;
}

export function PremiumActivityCard({
  title,
  description,
  dueDate,
  assignedAvatarUris,
  assignedNames,
  status = StatusEnum.TODO,
  onPress,
}: ActivityCardProps) {
  const { isDark } = useAppTheme();
  const pillLabel = formatDueDatePill(dueDate);
  const namesLabel = assignedNames?.length
    ? assignedNames.join(", ")
    : assignedAvatarUris?.length
      ? `Assignee${assignedAvatarUris.length > 1 ? "s" : ""}`
      : "";

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
      {/* Row 1: Title + Chevron */}
      <View className="flex-row items-center justify-between gap-2">
        <Text
          className={cn(
            "text-text-day dark:text-text-night flex-1 text-lg font-semibold",
            status === StatusEnum.OVERDUE &&
              "text-[#FF5050] dark:text-[#FF5050]"
          )}
          numberOfLines={1}
        >
          {title ?? ""}
        </Text>
        <View className="opacity-70">
          <ChevronRight width={18} height={18} />
        </View>
      </View>

      {/* Row 2: Due date pill */}
      {pillLabel ? (
        <View className="mt-2 self-start">
          <View className="rounded-lg bg-[#E8EEFC] px-1.5 py-1 dark:bg-[#2A3256]">
            <Text
              className={cn(
                "text-sm font-medium text-[#2563EB] dark:text-[#60A5FA]",
                status === StatusEnum.OVERDUE &&
                  "text-[#FF5050] dark:text-[#FF5050]"
              )}
            >
              {pillLabel} Due
            </Text>
          </View>
        </View>
      ) : null}

      {/* Row 3: Description */}
      {description ? (
        <Text
          className={cn(
            "text-hint mt-2 text-sm leading-5",
            status === StatusEnum.OVERDUE && "text-[#FF5050]/80"
          )}
          numberOfLines={4}
        >
          {description}
        </Text>
      ) : null}

      {/* Row 4: Avatars + names */}
      {(assignedAvatarUris?.length ?? 0) > 0 || namesLabel ? (
        <View className="mt-3 flex-row items-center gap-2">
          {assignedAvatarUris?.slice(0, 3).map((uri, index) => (
            <Avatar
              key={`${uri}-${index}`}
              alt={assignedNames?.[index] ?? `Assignee ${index + 1}`}
              className={cn(
                "border-background-day dark:border-background-night h-8 w-8 rounded-full border-2",
                index === 0 ? "ml-0" : "-ml-5"
              )}
            >
              <Avatar.Image source={{ uri }} />
              <Avatar.Fallback className="h-8 w-8 rounded-full bg-[#E5E5EA] dark:bg-[#3A3A3C]" />
            </Avatar>
          ))}
          {namesLabel ? (
            <Text className="text-hint text-sm">{namesLabel}</Text>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

export default PremiumActivityCard;

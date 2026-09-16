import { alert } from "@/assets/icons";
import { CachedAvatarImage } from "@/components/cached-avatar-image";
import ChevronRight from "@/components/icons/chevron-right";
import { SvgIcon } from "@/components/svg-icon";
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
  const d = new Date(dateTime);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "Friday" + " 6 days remaining" for the due-date pill (Figma 205:5933). */
function duePill(dateTime?: string): { day: string; rest: string } | null {
  const d = parseDateTime(dateTime);
  if (!d) return null;

  const toMidnight = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round(
    (toMidnight(d).getTime() - toMidnight(new Date()).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const day = WEEKDAY_NAMES[d.getDay()];

  if (diffDays === 0) return { day, rest: "Today" };
  if (diffDays === 1) return { day, rest: "Tomorrow" };
  if (diffDays === -1) return { day, rest: "Yesterday" };
  const count = Math.abs(diffDays);
  const unit = count === 1 ? "day" : "days";
  return {
    day,
    rest: `${count} ${unit} ${diffDays > 0 ? "remaining" : "ago"}`,
  };
}

const PILL = {
  normal: { bg: "rgba(4,167,255,0.1)", text: "#04A7FF" },
  overdue: { bg: "rgba(255,19,19,0.1)", text: "#FF1313" },
};

/** Family-tab task card (Figma 205:5933): title, due pill, description, members. */
export function PremiumActivityCard({
  title,
  description,
  dueDate,
  assignedAvatarUris,
  assignedNames,
  status = StatusEnum.TODO,
  onPress,
}: ActivityCardProps) {
  const overdue = status === StatusEnum.OVERDUE;
  const pill = duePill(dueDate);
  const colors = overdue ? PILL.overdue : PILL.normal;
  const namesLabel = assignedNames?.length ? assignedNames.join(", ") : "";

  return (
    <Pressable
      onPress={onPress}
      className="bg-primary-day dark:bg-primary-night rounded-2xl px-4 py-3.5 active:opacity-95"
    >
      {/* Title row */}
      <View className="flex-row items-center gap-2">
        {overdue ? (
          <View className="size-5 items-center justify-center rounded-full bg-[#FF1313]">
            <SvgIcon art={alert} size={12} />
          </View>
        ) : null}
        <Text
          className={cn(
            "text-text-day dark:text-text-night flex-1 text-base leading-[22px] font-semibold",
            status === StatusEnum.COMPLETED && "line-through opacity-60"
          )}
          numberOfLines={1}
        >
          {title ?? ""}
        </Text>
        <ChevronRight width={6} height={10} />
      </View>

      {/* Due-date pill */}
      {pill ? (
        <View
          className="mt-2 self-start rounded-sm px-2 py-[3px]"
          style={{ backgroundColor: colors.bg }}
        >
          <Text
            className="text-xs leading-4"
            style={{ color: colors.text }}
            numberOfLines={1}
          >
            <Text className="font-semibold">{pill.day}</Text>
            <Text style={{ opacity: 0.55 }}> · </Text>
            {pill.rest}
          </Text>
        </View>
      ) : null}

      {/* Description */}
      {description ? (
        <Text className="text-hint mt-2.5 text-sm leading-5" numberOfLines={2}>
          {description}
        </Text>
      ) : null}

      {/* Assignees */}
      {(assignedAvatarUris?.length ?? 0) > 0 || namesLabel ? (
        <View className="mt-3 flex-row items-center gap-2">
          {assignedAvatarUris?.length ? (
            <View className="flex-row items-center">
              {assignedAvatarUris.slice(0, 3).map((uri, index) => (
                <Avatar
                  key={`${uri}-${index}`}
                  alt={assignedNames?.[index] ?? `Assignee ${index + 1}`}
                  className={cn(
                    "border-primary-day dark:border-primary-night size-7 rounded-full border-2",
                    index === 0 ? "ml-0" : "-ml-2.5"
                  )}
                >
                  <CachedAvatarImage uri={uri} />
                  <Avatar.Fallback className="size-7 rounded-full bg-[#E5E5EA] dark:bg-[#3A3A3C]" />
                </Avatar>
              ))}
            </View>
          ) : null}
          {namesLabel ? (
            <Text
              className="text-hint flex-1 text-[13px] leading-[18px]"
              numberOfLines={1}
            >
              {namesLabel}
            </Text>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

export default PremiumActivityCard;

import { Link } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "@/contexts/app-theme-context";
import { StatusEnum as Status } from "@/type";
import { useTranslation } from "react-i18next";
import { SvgProps } from "react-native-svg";
import ArchiveIcon from "./icons/archive-icon";
import ChevronRight from "./icons/chevron-right";
import ClockIcon from "./icons/clock-icon";
import FileIcon from "./icons/file-icon";
import TrophyIcon from "./icons/trophy-icon";

/** Icon tile colours per status, shared with the empty states. */
export const STATUS_COLORS = {
  [Status.TODO]: "#A06CFF",
  [Status.COMPLETED]: "#72D000",
  [Status.OVERDUE]: "#FF5050",
} as const;

export const archivedTileColor = (isDark: boolean) =>
  isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)";

const cards: Record<Status, { icon: React.FC<SvgProps>; route: string }> = {
  [Status.TODO]: { icon: FileIcon, route: "todo" },
  [Status.COMPLETED]: { icon: TrophyIcon, route: "completed" },
  [Status.OVERDUE]: { icon: ClockIcon, route: "overdue" },
  [Status.ARCHIVED]: { icon: ArchiveIcon, route: "archive" },
};

/** One compact tile of the 2x2 summary grid on the Tasks tab (Figma 205:6066). */
const StatsCard = ({ type, value }: { type: Status; value: number }) => {
  const { t } = useTranslation();
  const { isDark } = useAppTheme();
  const { icon: Icon, route } = cards[type];
  const tileColor =
    type === Status.ARCHIVED ? archivedTileColor(isDark) : STATUS_COLORS[type];

  return (
    <Link href={`/${route}`} asChild>
      <TouchableOpacity
        activeOpacity={0.85}
        className="bg-primary-day dark:bg-primary-night flex-1 flex-row items-center gap-3 rounded-2xl px-3.5 py-3"
      >
        <View
          className="size-9 items-center justify-center rounded-xl"
          style={{ backgroundColor: tileColor }}
        >
          <Icon width={18} height={18} />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-text-day dark:text-text-night text-lg leading-6 font-semibold">
            {value}
          </Text>
          <Text className="text-hint text-xs" numberOfLines={1}>
            {t(`statuses.${route}`)}
          </Text>
        </View>
        <ChevronRight />
      </TouchableOpacity>
    </Link>
  );
};

export default StatsCard;

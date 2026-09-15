import { cn } from "heroui-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface CategoryCardProps {
  title: string;
  /** Number of open tasks in this category. */
  count: number;
  iconBackground?: string;
  icon: React.ReactNode;
  selected?: boolean;
  onPress?: () => void;
}

/**
 * Compact category filter tile for the Family tab: icon, label and open-task
 * count. Tapping filters the task list; tapping again clears it.
 */
const CategoryCard = ({
  title,
  count,
  iconBackground,
  icon,
  selected = false,
  onPress,
}: CategoryCardProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${title}, ${count} open`}
      className={cn(
        "bg-primary-day dark:bg-primary-night flex-row items-center gap-2.5 rounded-xl border-[1.5px] py-2 pr-4 pl-2.5",
        selected ? "border-main" : "border-transparent"
      )}
    >
      <View
        className="size-8 items-center justify-center rounded-full"
        style={{ backgroundColor: iconBackground }}
      >
        {icon}
      </View>
      <View>
        <Text
          className="text-text-day dark:text-text-night text-sm font-semibold"
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text
          className={cn(
            "text-xs",
            selected ? "text-main font-medium" : "text-hint"
          )}
        >
          {count === 1 ? "1 open" : `${count} open`}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default CategoryCard;

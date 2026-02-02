import { cn } from "heroui-native";
import { Pressable, Text, View } from "react-native";

export type FilterKey = "all" | "todo" | "completed" | "overdue";

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export const FilterChip = ({ label, active, onPress }: FilterChipProps) => (
  <Pressable onPress={onPress}>
    <View
      className={cn(
        "rounded-lg px-6 py-1.5",
        active ? "bg-main" : "bg-primary-day dark:bg-primary-night"
      )}
    >
      <Text
        className={cn(
          "text-text-day dark:text-text-night text-base font-medium",
          active ? "text-white" : "text-text-day dark:text-text-night"
        )}
      >
        {label}
      </Text>
    </View>
  </Pressable>
);

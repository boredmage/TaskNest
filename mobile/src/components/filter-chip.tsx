import { cn } from "heroui-native";
import { Pressable, Text, View } from "react-native";

export type FilterKey = "all" | "todo" | "completed" | "overdue";

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

/** Compact 32pt filter pill. */
export const FilterChip = ({ label, active, onPress }: FilterChipProps) => (
  <Pressable onPress={onPress} className="active:opacity-80">
    <View
      className={cn(
        "h-8 items-center justify-center rounded-lg px-3",
        active ? "bg-main" : "bg-primary-day dark:bg-primary-night"
      )}
    >
      <Text
        className={cn(
          "text-[13px] font-medium",
          active ? "text-white" : "text-text-day dark:text-text-night"
        )}
      >
        {label}
      </Text>
    </View>
  </Pressable>
);

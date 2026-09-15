import { Text, TouchableOpacity, View } from "react-native";

type TabHeaderProps = {
  title: string;
  /** 28pt glyph shown at the right edge. */
  right?: React.ReactNode;
  onRightPress?: () => void;
  /** Keep the right slot's space but hide it (so the title never shifts). */
  rightHidden?: boolean;
};

/**
 * 56pt tab header shared by the four tabs (Figma "Head / Content"), so the
 * title, search bar and first card row sit at the same height on every tab.
 */
export function TabHeader({
  title,
  right,
  onRightPress,
  rightHidden,
}: TabHeaderProps) {
  return (
    <View className="h-11 flex-row items-center px-4">
      <View className="flex-1" />
      <Text className="text-text-day dark:text-text-night text-xl font-semibold">
        {title}
      </Text>
      <View className="flex-1 items-end">
        {right ? (
          <TouchableOpacity
            onPress={onRightPress}
            activeOpacity={0.8}
            hitSlop={10}
            disabled={rightHidden}
            style={{ opacity: rightHidden ? 0 : 1 }}
          >
            {right}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

export default TabHeader;

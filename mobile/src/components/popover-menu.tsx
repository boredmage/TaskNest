import { cn } from "heroui-native";
import { Modal, Pressable, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

export type PopoverMenuItem = {
  label: string;
  icon?: React.ReactNode;
  destructive?: boolean;
  onPress: () => void;
};

type PopoverMenuProps = {
  open: boolean;
  onClose: () => void;
  items: PopoverMenuItem[];
  /** Distance from the top of the screen to the menu. */
  top: number;
  right?: number;
  width?: number;
};

/** Anchored action menu (Figma 205:6431): 240pt wide, 50pt rows. */
export function PopoverMenu({
  open,
  onClose,
  items,
  top,
  right = 16,
  width = 240,
}: PopoverMenuProps) {
  return (
    <Modal
      transparent
      visible={open}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable className="flex-1" onPress={onClose}>
        <Animated.View
          entering={FadeIn.duration(120)}
          exiting={FadeOut.duration(120)}
          style={{
            position: "absolute",
            top,
            right,
            width,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <View className="bg-primary-day dark:bg-primary-night overflow-hidden rounded-xl">
            {items.map((item, index) => (
              <Pressable
                key={item.label}
                onPress={() => {
                  onClose();
                  item.onPress();
                }}
                className={cn(
                  "h-[50px] flex-row items-center justify-between px-4 active:opacity-70",
                  index < items.length - 1 && "border-b border-[#808080]/30"
                )}
              >
                <Text
                  className={cn(
                    "text-base",
                    item.destructive
                      ? "text-[#FF1313]"
                      : "text-text-day dark:text-text-night"
                  )}
                >
                  {item.label}
                </Text>
                {item.icon}
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

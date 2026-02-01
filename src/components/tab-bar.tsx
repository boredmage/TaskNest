import { useAppTheme } from "@/contexts/app-theme-context";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import React from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import NewsIcon from "./icons/bell";
import TasksIcon from "./icons/file";
import HomeIcon from "./icons/home";
import PlusIcon from "./icons/plus";
import SettingsIcon from "./icons/settings";

const ACTIVE_COLOR = "#72D000";
const INACTIVE_COLOR = "#A0A0A0";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BAR_HEIGHT = 50;
const NOTCH_RADIUS = 40;

const icons = {
  index: HomeIcon,
  tasks: TasksIcon,
  news: NewsIcon,
  settings: SettingsIcon,
} as const;

const TabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const fabScale = useSharedValue(1);
  const { isDark } = useAppTheme();

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -NOTCH_RADIUS + 10 }, { scale: fabScale.value }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    shadowOpacity: 0.25,
    elevation: 12,
  }));

  return (
    <View pointerEvents="box-none" className="absolute right-0 bottom-0 left-0">
      {/* Bottom bar with curved notch */}
      <View
        style={{
          height: BAR_HEIGHT + NOTCH_RADIUS,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowRadius: 20,
          shadowOpacity: 0.1,
        }}
        className="w-full items-end justify-center overflow-hidden rounded-t-lg"
      >
        <Svg
          width="100%"
          height={BAR_HEIGHT + NOTCH_RADIUS}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          <Path
            fill={isDark ? "#3C3C3C" : "#FFFFFF"}
            fillRule="evenodd"
            d={createNotchedPath(SCREEN_WIDTH, BAR_HEIGHT, NOTCH_RADIUS)}
          />
        </Svg>

        <View className="flex-row items-center justify-between gap-4 pb-5">
          {/* Left two tabs */}
          <View className="flex-1 flex-row items-center">
            {state.routes.slice(0, 2).map((route, index) => {
              if (["_sitemap", "+not-found"].includes(route.name)) return null;

              const { options } = descriptors[route.key];
              const label =
                typeof options.tabBarLabel === "string"
                  ? options.tabBarLabel
                  : (options.title ?? route.name);

              const isFocused = state.index === state.routes.indexOf(route);

              const onPress = () => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              };

              const IconComponent = icons[route.name as keyof typeof icons];
              if (!IconComponent) return null;

              return (
                <TouchableOpacity
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  testID={options.tabBarButtonTestID}
                  onPress={onPress}
                  activeOpacity={0.8}
                  className="flex-1 items-center justify-center gap-1.5"
                >
                  <IconComponent
                    width={22}
                    height={22}
                    color={isFocused ? ACTIVE_COLOR : INACTIVE_COLOR}
                  />
                  <Text
                    style={{
                      fontSize: 11,
                      color: isFocused ? ACTIVE_COLOR : INACTIVE_COLOR,
                    }}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Center spacer under the notch */}
          <View className="w-14" />

          {/* Right two tabs */}
          <View className="flex-1 flex-row items-center">
            {state.routes.slice(-2).map((route, index) => {
              if (["_sitemap", "+not-found"].includes(route.name)) return null;

              const { options } = descriptors[route.key];
              const label =
                typeof options.tabBarLabel === "string"
                  ? options.tabBarLabel
                  : (options.title ?? route.name);

              const isFocused = state.index === state.routes.indexOf(route);

              const onPress = () => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              };

              const IconComponent = icons[route.name as keyof typeof icons];
              if (!IconComponent) return null;

              return (
                <TouchableOpacity
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  testID={options.tabBarButtonTestID}
                  onPress={onPress}
                  activeOpacity={0.8}
                  className="flex-1 items-center justify-center gap-1.5"
                >
                  <IconComponent
                    width={22}
                    height={22}
                    color={isFocused ? ACTIVE_COLOR : INACTIVE_COLOR}
                  />
                  <Text
                    style={{
                      fontSize: 11,
                      color: isFocused ? ACTIVE_COLOR : INACTIVE_COLOR,
                    }}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* Floating center plus button */}
      <Animated.View
        className="absolute top-0 self-center"
        style={fabAnimatedStyle}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={() => {
            fabScale.value = withTiming(0.92, { duration: 80 });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          onPressOut={() => {
            fabScale.value = withTiming(1, { duration: 120 });
          }}
          onPress={() => {
            navigation.navigate("new-task");
          }}
        >
          <View className="bg-main h-14 w-14 items-center justify-center rounded-full">
            <PlusIcon width={22} height={22} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default TabBar;
function createNotchedPath(width: number, barHeight: number, radius: number) {
  const w = width;
  const h = barHeight + radius;
  const notchCenterX = w / 2;
  const notchCenterY = 0;

  // Outer rectangle
  const rect = `M0,0 H${w} V${h} H0 Z`;

  // Circular notch cut-out at the top center (using even-odd fill rule)
  const r = radius;
  const circle = [
    `M${notchCenterX},${notchCenterY}`,
    `m${-r},0`,
    `a${r},${r} 0 1,0 ${2 * r},0`,
    `a${r},${r} 0 1,0 ${-2 * r},0`,
  ].join(" ");

  return `${rect} ${circle}`;
}

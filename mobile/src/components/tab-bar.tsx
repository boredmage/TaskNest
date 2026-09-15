import { plus, tabBell, tabFile, tabHome, tabSettings } from "@/assets/icons";
import { SvgIcon } from "@/components/svg-icon";
import { useAppTheme } from "@/contexts/app-theme-context";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

// Figma 196:5232 — bar 81pt tall (16pt of it under the labels), 6pt corners,
// a 35pt-radius notch on the top edge and a 46pt button centred on that edge.
const FAB = 46;
const NOTCH_R = 35;
const CORNER = 6;
const TABS_TOP = 17; // icons start 17pt below the bar's top edge
const TABS_H = 48; // 28 icon + 4 gap + 16 label
const MIN_BOTTOM = 16;

const ACTIVE = "#72D000";
const LABEL = "#A0A0A0";

const icons = {
  index: tabHome,
  tasks: tabFile,
  news: tabBell,
  settings: tabSettings,
} as const;

const TabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const { isDark } = useAppTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const fabScale = useSharedValue(1);

  const bottomPad = Math.max(insets.bottom, MIN_BOTTOM);
  const barHeight = TABS_TOP + TABS_H + bottomPad;
  const fill = isDark ? "#303030" : "#FFFFFF";
  const inactive = isDark ? "#808080" : "#D5D5D5";

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const renderTab = (route: (typeof state.routes)[number]) => {
    const { options } = descriptors[route.key];
    const label =
      typeof options.tabBarLabel === "string"
        ? options.tabBarLabel
        : (options.title ?? route.name);
    const isFocused = state.index === state.routes.indexOf(route);
    const art = icons[route.name as keyof typeof icons];
    if (!art) return null;

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

    return (
      <TouchableOpacity
        key={route.key}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        testID={options.tabBarButtonTestID}
        onPress={onPress}
        activeOpacity={0.8}
        className="flex-1 items-center gap-1"
      >
        <SvgIcon art={art} size={28} color={isFocused ? ACTIVE : inactive} />
        <Text
          style={{
            fontSize: 12,
            lineHeight: 16,
            fontWeight: isFocused ? "600" : "400",
            color: isFocused ? ACTIVE : LABEL,
          }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const tabs = state.routes.filter(
    (r) => !["_sitemap", "+not-found"].includes(r.name)
  );

  return (
    <View
      pointerEvents="box-none"
      className="absolute right-0 bottom-0 left-0"
      style={{ height: barHeight + FAB / 2 }}
    >
      {/* Bar shape with its soft upward shadow */}
      <View
        pointerEvents="none"
        className="absolute right-0 bottom-0 left-0"
        style={{
          height: barHeight,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 7.5,
          elevation: 8,
        }}
      >
        <Svg width={width} height={barHeight}>
          <Path fill={fill} d={notchedBarPath(width, barHeight)} />
        </Svg>
      </View>

      {/* Two tabs, the notch, two tabs */}
      <View
        className="absolute right-0 left-0 flex-row"
        style={{ top: FAB / 2 + TABS_TOP, height: TABS_H }}
      >
        {tabs.slice(0, 2).map(renderTab)}
        <View className="flex-1" />
        {tabs.slice(-2).map(renderTab)}
      </View>

      {/* Floating "new task" button, centred on the bar's top edge */}
      <Animated.View
        className="absolute top-0 self-center"
        style={[{ width: FAB, height: FAB }, fabStyle]}
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
          onPress={() => navigation.navigate("new-task")}
          className="bg-main size-full items-center justify-center rounded-full"
        >
          <SvgIcon art={plus} size={24} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default TabBar;

/**
 * The bar outline from the Figma export: rounded rectangle with a circular
 * notch (radius 35) cut into the top edge, eased into the edge by small
 * shoulder curves.
 */
function notchedBarPath(w: number, h: number) {
  const cx = w / 2;
  const r = CORNER;
  // Where the notch arc meets the shoulder curve (from the Figma path).
  const ax = 34.492;
  const ay = 5.9735;
  const shoulder = 41; // shoulder curve ends this far from centre, on the edge
  return [
    `M ${cx} ${NOTCH_R}`,
    `A ${NOTCH_R} ${NOTCH_R} 0 0 0 ${cx + ax} ${ay}`,
    `C ${cx + 35.054} 2.7077 ${cx + 37.686} 0 ${cx + shoulder} 0`,
    `H ${w - r}`,
    `A ${r} ${r} 0 0 1 ${w} ${r}`,
    `V ${h}`,
    `H 0`,
    `V ${r}`,
    `A ${r} ${r} 0 0 1 ${r} 0`,
    `H ${cx - shoulder}`,
    `C ${cx - 37.686} 0 ${cx - 35.054} 2.7077 ${cx - ax} ${ay}`,
    `A ${NOTCH_R} ${NOTCH_R} 0 0 0 ${cx} ${NOTCH_R}`,
    "Z",
  ].join(" ");
}

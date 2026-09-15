import { useAppTheme } from "@/contexts/app-theme-context";
import { View } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";

const ACTIVE = "#72D000";
const INACTIVE_LIGHT = "rgba(0,0,0,0.06)";
const INACTIVE_DARK = "rgba(255,255,255,0.1)";

/** The 20 x 6 active / 6 x 6 inactive dots from the design, driven by carousel progress. */
export function PageControl({
  count,
  progress,
}: {
  count: number;
  progress: SharedValue<number>;
}) {
  const { isDark } = useAppTheme();
  const inactive = isDark ? INACTIVE_DARK : INACTIVE_LIGHT;
  return (
    <View className="flex-row items-center gap-1.5 py-2">
      {Array.from({ length: count }, (_, i) => (
        <Dot key={i} index={i} progress={progress} inactive={inactive} />
      ))}
    </View>
  );
}

function Dot({
  index,
  progress,
  inactive,
}: {
  index: number;
  progress: SharedValue<number>;
  inactive: string;
}) {
  const style = useAnimatedStyle(() => {
    const distance = Math.min(Math.abs(progress.value - index), 1);
    return {
      width: interpolate(distance, [0, 1], [20, 6]),
      backgroundColor: interpolateColor(distance, [0, 1], [ACTIVE, inactive]),
    };
  });
  return <Animated.View style={[{ height: 6, borderRadius: 100 }, style]} />;
}

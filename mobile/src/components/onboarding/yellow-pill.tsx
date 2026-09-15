import type { StyleProp, ViewStyle } from "react-native";
import Animated, { type AnimatedStyle } from "react-native-reanimated";

export const PILL_WIDTH = 300;
export const PILL_HEIGHT = 150;
export const PILL_COLOR = "#FFF457";

/**
 * The yellow capsule behind every onboarding illustration: 300 x 150,
 * fully rounded, rotated 45 degrees, placed by its centre.
 */
export function YellowPill({
  cx,
  cy,
  style,
}: {
  cx: number;
  cy: number;
  style?: StyleProp<AnimatedStyle<ViewStyle>>;
}) {
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left: cx - PILL_WIDTH / 2,
          top: cy - PILL_HEIGHT / 2,
          width: PILL_WIDTH,
          height: PILL_HEIGHT,
          borderRadius: 100,
          backgroundColor: PILL_COLOR,
          transform: [{ rotate: "-45deg" }],
        },
        style,
      ]}
    />
  );
}

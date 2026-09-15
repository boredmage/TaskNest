import { useState } from "react";
import { View, type ViewProps } from "react-native";

/** Size of the Figma frame the onboarding screens were designed on. */
export const FRAME_WIDTH = 402;
export const FRAME_HEIGHT = 874;
/** The illustration area: everything above the bottom card in the design. */
export const CANVAS_HEIGHT = 585;

/**
 * A fixed 402 x 585 box in Figma coordinates, scaled uniformly to fit its
 * parent. Children position themselves with the exact numbers from the
 * design and the whole illustration adapts to any phone size.
 */
export function DesignCanvas({
  children,
  ...props
}: { children: React.ReactNode } & ViewProps) {
  const [scale, setScale] = useState(0);

  return (
    <View
      {...props}
      className="flex-1 items-center justify-center"
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setScale(Math.min(width / FRAME_WIDTH, height / CANVAS_HEIGHT));
      }}
    >
      {scale > 0 ? (
        <View
          style={{
            width: FRAME_WIDTH,
            height: CANVAS_HEIGHT,
            transform: [{ scale }],
          }}
        >
          {children}
        </View>
      ) : null}
    </View>
  );
}

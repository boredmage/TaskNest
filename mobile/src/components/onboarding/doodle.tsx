import type { Art } from "@/assets/onboarding/doodles";
import { useEffect } from "react";
import { View, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SvgXml } from "react-native-svg";

type RevealProps = {
  /** Whether the slide this belongs to is on screen. */
  active: boolean;
  /** Stagger offset in ms so items pop in one after another. */
  delay?: number;
};

const POP = { damping: 13, stiffness: 170, mass: 0.8 };

/**
 * Pops its children in (fade + scale + rise) when `active` flips true and
 * hides them again when it flips false. Every illustrated element on the
 * onboarding slides is wrapped in one of these.
 */
export function Reveal({
  active,
  delay = 0,
  children,
  style,
}: RevealProps & { children: React.ReactNode; style?: ViewStyle }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = active
      ? withDelay(delay, withSpring(1, POP))
      : withTiming(0, { duration: 180 });
  }, [active, delay]);

  const animated = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { scale: 0.4 + 0.6 * progress.value },
      { translateY: 14 * (1 - progress.value) },
    ],
  }));

  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

/** Gentle up/down drift so cards and avatars feel alive. */
export function Float({
  children,
  distance = 5,
  duration = 1800,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  distance?: number;
  duration?: number;
  delay?: number;
  style?: ViewStyle;
}) {
  const y = useSharedValue(0);

  useEffect(() => {
    const ease = Easing.inOut(Easing.sin);
    y.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-distance, { duration, easing: ease }),
          withTiming(distance, { duration, easing: ease })
        ),
        -1,
        true
      )
    );
  }, []);

  const animated = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));

  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

type DoodleProps = RevealProps & {
  art: Art;
  /** Centre of the doodle in Figma frame coordinates. */
  cx: number;
  cy: number;
  rotate?: number;
  flipX?: boolean;
};

/**
 * One exported vector from the design, placed by its centre and rotated the
 * way it is in Figma (the export is the unrotated shape).
 */
export function Doodle({
  art,
  cx,
  cy,
  rotate = 0,
  flipX,
  active,
  delay,
}: DoodleProps) {
  return (
    // Rotation lives on the outer view so the reveal's own transform can't replace it.
    <View
      style={{
        position: "absolute",
        left: cx - art.w / 2,
        top: cy - art.h / 2,
        width: art.w,
        height: art.h,
        transform: [{ scaleX: flipX ? -1 : 1 }, { rotate: `${rotate}deg` }],
      }}
    >
      <Reveal active={active} delay={delay}>
        <SvgXml xml={art.xml} width={art.w} height={art.h} />
      </Reveal>
    </View>
  );
}

/** Absolutely positions a child by its top-left corner in frame coordinates. */
export function At({
  x,
  y,
  children,
  style,
}: {
  x: number;
  y: number;
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <Animated.View style={[{ position: "absolute", left: x, top: y }, style]}>
      {children}
    </Animated.View>
  );
}

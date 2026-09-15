import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

const AnimatedPath = Animated.createAnimatedComponent(Path);

/**
 * One loop, as a fraction of CYCLE:
 *   0     – 0.25    ring draws clockwise from 11 o'clock over the top
 *   0.25  – 0.328   checkmark draws while the ring gives a small pop
 *   0.328 – 0.375   hold
 *   0.375 – 0.9375  ring spins three full turns around the checkmark
 *   0.9375 – 1      everything fades out, then the loop restarts
 */
const CYCLE = 6400;
const RING_DRAWN = 0.25;
const RING_LEN = 231; // 330° arc of a radius-40 circle
const TICK_LEN = 62;

const ringEase = Easing.bezierFn(0.45, 0, 0.2, 1);
const tickEase = Easing.bezierFn(0.2, 0.8, 0.3, 1.15);
const popEase = Easing.bezierFn(0.3, 1.3, 0.6, 1);
const easeOut = Easing.out(Easing.ease);
const easeIn = Easing.in(Easing.ease);

/** Progress (0–1) of the segment [from, to] at time t, eased. */
function seg(t: number, from: number, to: number, ease: (x: number) => number) {
  "worklet";
  if (t <= from) return 0;
  if (t >= to) return 1;
  return ease((t - from) / (to - from));
}

type Props = {
  size?: number;
  color?: string;
  /**
   * Pull-to-refresh progress (0–1) while the user is dragging. When given,
   * the ring draws in step with the pull instead of on a timer, and the
   * timed loop only starts once `active` is true.
   */
  progress?: SharedValue<number>;
  /** Run the timed loop. Defaults to true when no `progress` is supplied. */
  active?: boolean;
};

/** Animated "ring draws, check draws, ring spins" loader. */
export function CheckmarkLoader({
  size = 40,
  color = "#72D000",
  progress,
  active = progress === undefined,
}: Props) {
  const t = useSharedValue(0);
  const running = useSharedValue(false);

  useEffect(() => {
    if (!active) {
      running.value = false;
      cancelAnimation(t);
      t.value = 0;
      return;
    }
    running.value = true;
    // Driven by a pull, the ring is already drawn on release, so the loop
    // picks up from the checkmark; otherwise it starts by drawing the ring.
    const start = progress ? RING_DRAWN : 0;
    t.value = start;
    t.value = withSequence(
      withTiming(1, {
        duration: CYCLE * (1 - start),
        easing: Easing.linear,
      }),
      withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(1, { duration: CYCLE, easing: Easing.linear })
        ),
        -1,
        false
      )
    );
    return () => cancelAnimation(t);
    // `progress` identity is stable; only `active` should restart the loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const ringProps = useAnimatedProps(() => {
    const drawn = running.value
      ? seg(t.value, 0, RING_DRAWN, ringEase)
      : Math.min(Math.max(progress?.value ?? 1, 0), 1);
    return { strokeDashoffset: RING_LEN * (1 - drawn) };
  });

  const tickProps = useAnimatedProps(() => ({
    strokeDashoffset: running.value
      ? TICK_LEN * (1 - Math.min(1, seg(t.value, RING_DRAWN, 0.328, tickEase)))
      : TICK_LEN,
  }));

  const ringStyle = useAnimatedStyle(() => {
    if (!running.value)
      return { transform: [{ rotate: "0deg" }, { scale: 1 }] };
    const v = t.value;
    const scale =
      v < 0.28
        ? 1 + 0.07 * seg(v, RING_DRAWN, 0.28, popEase)
        : 1.07 - 0.07 * seg(v, 0.28, 0.328, easeOut);
    const rotate = 1080 * seg(v, 0.375, 0.9375, Easing.linear);
    return { transform: [{ rotate: `${rotate}deg` }, { scale }] };
  });

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: running.value ? 1 - seg(t.value, 0.9375, 1, easeIn) : 1,
  }));

  const stroke = {
    stroke: color,
    strokeWidth: 7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };

  return (
    <Animated.View style={[{ width: size, height: size }, fadeStyle]}>
      <Animated.View style={[StyleSheet.absoluteFill, ringStyle]}>
        {/* viewBox padded so the stroke and the pop never clip */}
        <Svg width={size} height={size} viewBox="-6 -6 112 112">
          <AnimatedPath
            d="M30 15.36 A40 40 0 1 1 15.36 30"
            strokeDasharray={RING_LEN}
            animatedProps={ringProps}
            {...stroke}
          />
        </Svg>
      </Animated.View>
      <View style={StyleSheet.absoluteFill}>
        <Svg width={size} height={size} viewBox="-6 -6 112 112">
          <AnimatedPath
            d="M29 51 L45 67 L71 40"
            strokeDasharray={TICK_LEN}
            animatedProps={tickProps}
            {...stroke}
          />
        </Svg>
      </View>
    </Animated.View>
  );
}

export default CheckmarkLoader;

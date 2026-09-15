import { BlurView } from "expo-blur";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  ZoomIn,
} from "react-native-reanimated";

type SuccessOverlayProps = {
  /** 28pt glyph drawn inside the green 68pt circle. */
  icon: React.ReactNode;
  title: string;
  body: string;
  /** Rendered under the copy, e.g. <PulseDots /> or a button. */
  footer?: React.ReactNode;
};

/**
 * Full-screen blurred backdrop with a centred 312pt success card
 * (Figma 205:5869, 205:12220). The caller decides when it goes away.
 */
export function SuccessOverlay({
  icon,
  title,
  body,
  footer,
}: SuccessOverlayProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(250)}
      style={StyleSheet.absoluteFill}
      pointerEvents="auto"
    >
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <View className="flex-1 items-center justify-center bg-black/20 px-4">
        <Animated.View
          entering={ZoomIn.duration(320).easing(Easing.out(Easing.back(1.4)))}
        >
          <View className="bg-background-day dark:bg-background-night w-[312px] items-center gap-6 rounded-[20px] px-4 py-5">
            <View className="bg-main size-[68px] items-center justify-center rounded-full">
              {icon}
            </View>
            <View className="w-full gap-2.5">
              <Text className="text-text-day dark:text-text-night text-center text-xl font-semibold">
                {title}
              </Text>
              <Text className="text-hint text-center text-base leading-[22px]">
                {body}
              </Text>
            </View>
            {footer}
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

/** Three dots that light up in turn, like the design's pulse loader. */
export function PulseDots() {
  return (
    <View className="h-12 flex-row items-center justify-center gap-2">
      {[0, 1, 2].map((i) => (
        <Dot key={i} delay={i * 200} />
      ))}
    </View>
  );
}

function Dot({ delay }: { delay: number }) {
  const lit = useSharedValue(0);

  useEffect(() => {
    lit.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0, { duration: 300 })
        ),
        -1
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: 0.35 + 0.65 * lit.value,
    transform: [{ scale: 1 + 0.25 * lit.value }],
  }));

  return (
    <Animated.View className="bg-main size-2.5 rounded-full" style={style} />
  );
}

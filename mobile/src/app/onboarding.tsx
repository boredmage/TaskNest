import { CustomButton } from "@/components/custom-button";
import {
  CANVAS_HEIGHT,
  DesignCanvas,
  FRAME_WIDTH,
} from "@/components/onboarding/canvas";
import { PageControl } from "@/components/onboarding/page-control";
import {
  EverythingSlide,
  FamilySlide,
  SyncSlide,
} from "@/components/onboarding/slides";
import { WelcomeCard } from "@/components/onboarding/welcome-card";
import { YellowPill } from "@/components/onboarding/yellow-pill";
import { useSheetCardStyle } from "@/lib/sheet-corners";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import { Text, View, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  FadeOutUp,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import Carousel, {
  type ICarouselInstance,
} from "react-native-reanimated-carousel";

const steps = [
  {
    title: "Organize as a Family",
    description:
      "Assign chores and stay on the same page — your family, working as one team.",
    Slide: FamilySlide,
  },
  {
    title: "Stay in Sync",
    description: "Get notified when tasks are done and see changes instantly.",
    Slide: SyncSlide,
  },
  {
    title: "One Place for Everything",
    description: "Groceries, events, and plans — manage it all in one app.",
    Slide: EverythingSlide,
  },
];

/** Where the capsule sits behind the slides (Figma frame coordinates). */
const PILL_CENTER = { cx: 201, cy: 329 };

const SLIDE_MS = 420;
const WELCOME_SPRING = { damping: 18, stiffness: 140, mass: 0.9 };

export default function Onboarding() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  // The card hugs the bottom edge with the same gap it has at the sides, and
  // its bottom corners run concentric to the screen's rounded corners.
  const cardCorners = useSheetCardStyle();
  const carouselRef = useRef<ICarouselInstance>(null);
  const [step, setStep] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const isLastStep = step === steps.length - 1;

  /** Carousel position, 0..2, drives the page dots and the zoom transition. */
  const progress = useSharedValue(0);
  /** 0 = onboarding slides, 1 = welcome card. */
  const welcome = useSharedValue(0);

  // Flip the active step halfway through a transition (not at the end) so the
  // incoming slide's pieces pop in while it is still growing.
  useAnimatedReaction(
    () => Math.round(progress.value),
    (current, previous) => {
      if (previous !== null && current !== previous) runOnJS(setStep)(current);
    }
  );

  const openWelcome = () => {
    setShowWelcome(true);
    welcome.value = withSpring(1, WELCOME_SPRING);
  };
  const closeWelcome = () => {
    welcome.value = withTiming(0, {
      duration: 380,
      easing: Easing.out(Easing.cubic),
    });
    setShowWelcome(false);
  };
  const goNext = () => {
    if (isLastStep) return openWelcome();
    carouselRef.current?.next();
  };

  // --- animated styles -------------------------------------------------------
  const slidesStyle = useAnimatedStyle(() => ({
    opacity: 1 - welcome.value,
    transform: [{ scale: 1 - 0.1 * welcome.value }],
  }));

  const centerPillStyle = useAnimatedStyle(() => ({
    opacity: 1 - welcome.value,
    transform: [{ rotate: "-45deg" }, { scale: 1 - 0.6 * welcome.value }],
  }));

  const bottomCardStyle = useAnimatedStyle(() => ({
    opacity: 1 - welcome.value,
    transform: [{ translateY: 360 * welcome.value }],
  }));

  const welcomeCardStyle = useAnimatedStyle(() => ({
    opacity: interpolate(welcome.value, [0, 0.4, 1], [0, 0.6, 1]),
    transform: [
      {
        translateY: interpolate(
          welcome.value,
          [0, 1],
          [screenHeight * 0.45, 0]
        ),
      },
      { scale: interpolate(welcome.value, [0, 1], [0.92, 1]) },
    ],
  }));

  const topLeftPillStyle = useCornerPillStyle(welcome, -155, -184);
  const bottomRightPillStyle = useCornerPillStyle(welcome, 155, 184);

  return (
    <View className="bg-main flex-1">
      <StatusBar style="light" />
      {/* Welcome-screen capsules, anchored at screen centre like Figma 2:240 */}
      <View pointerEvents="none" className="absolute inset-0">
        <YellowPill
          cx={screenWidth / 2 - 155}
          cy={screenHeight / 2 - 184}
          style={topLeftPillStyle}
        />
        <YellowPill
          cx={screenWidth / 2 + 155}
          cy={screenHeight / 2 + 184}
          style={bottomRightPillStyle}
        />
      </View>

      <View style={{ flex: 1 }}>
        {/* Illustration -------------------------------------------------- */}
        <DesignCanvas>
          <YellowPill {...PILL_CENTER} style={centerPillStyle} />
          <Animated.View style={[{ flex: 1 }, slidesStyle]}>
            <Carousel
              ref={carouselRef}
              width={FRAME_WIDTH}
              height={CANVAS_HEIGHT}
              data={steps}
              loop={false}
              enabled={!showWelcome}
              scrollAnimationDuration={SLIDE_MS}
              onProgressChange={(_, absolute) => {
                progress.value = absolute;
              }}
              customAnimation={zoom}
              renderItem={({ item, index }) => (
                <View style={{ flex: 1 }}>
                  <item.Slide active={index === step && !showWelcome} />
                </View>
              )}
            />
          </Animated.View>
        </DesignCanvas>

        {/* Bottom card ---------------------------------------------------- */}
        <Animated.View
          pointerEvents={showWelcome ? "none" : "auto"}
          style={bottomCardStyle}
        >
          <View
            className="bg-background-day dark:bg-background-night gap-6 px-4 py-10"
            style={cardCorners}
          >
            <PageControl count={steps.length} progress={progress} />

            <View style={{ minHeight: 88 }}>
              <Animated.View
                key={step}
                entering={FadeInDown.duration(280).easing(
                  Easing.out(Easing.cubic)
                )}
                exiting={FadeOutUp.duration(160)}
              >
                <View className="gap-2.5">
                  <Text className="text-text-day dark:text-text-night text-xl font-semibold">
                    {steps[step].title}
                  </Text>
                  <Text className="text-text-day dark:text-text-night text-base leading-snug">
                    {steps[step].description}
                  </Text>
                </View>
              </Animated.View>
            </View>

            <View className="flex-row gap-2.5">
              <CustomButton
                className="h-[50px] flex-1"
                intent="secondary"
                onPress={openWelcome}
              >
                Skip
              </CustomButton>
              <CustomButton className="h-[50px] flex-1" onPress={goNext}>
                {isLastStep ? "Finish" : "Next"}
              </CustomButton>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Welcome card --------------------------------------------------- */}
      <View
        pointerEvents={showWelcome ? "box-none" : "none"}
        className="absolute inset-0 justify-center px-2.5"
      >
        <Animated.View style={welcomeCardStyle}>
          <WelcomeCard onClose={closeWelcome} />
        </Animated.View>
      </View>
    </View>
  );
}

/** The welcome screen's corner capsules grow out from the screen centre. */
function useCornerPillStyle(
  welcome: SharedValue<number>,
  dx: number,
  dy: number
) {
  return useAnimatedStyle(() => ({
    opacity: welcome.value,
    transform: [
      { translateX: dx * (welcome.value - 1) },
      { translateY: dy * (welcome.value - 1) },
      { rotate: "-45deg" },
      { scale: interpolate(welcome.value, [0, 1], [0.3, 1]) },
    ],
  }));
}

/**
 * Zoom transition: the leaving slide shrinks to nothing while the next one
 * grows out of the centre. Symmetric, so going back looks the same.
 */
function zoom(value: number) {
  "worklet";
  const t = Math.min(Math.abs(value), 1);
  return {
    opacity: interpolate(t, [0, 0.7, 1], [1, 0.25, 0]),
    transform: [{ scale: interpolate(t, [0, 1], [1, 0]) }],
    zIndex: t < 0.5 ? 1 : 0,
  };
}

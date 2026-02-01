import { Link, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Dimensions, Image, Text, View } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomButton } from "../components/custom-button";

import AppleIcon from "@/components/icons/apple-icon";
import GoogleIcon from "@/components/icons/google-icon";
import XIcon from "@/components/icons/x-icon";
import { Button } from "heroui-native";

const { width: screenWidth } = Dimensions.get("window");

const slide1 = require("../assets/pill.png");
const slide2 = require("../assets/pill.png");
const slide3 = require("../assets/pill.png");

const steps = [
  {
    title: "Organize as a Family",
    description:
      "Assign chores and stay on the same page — your family, working as one team.",
    image: slide1,
  },
  {
    title: "Stay in Sync",
    description: "Get notified when tasks are done and see changes instantly.",
    image: slide2,
  },
  {
    title: "One Place for Everything",
    description: "Groceries, events, and plans — manage it all in one app.",
    image: slide3,
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [completedSteps, setCompletedSteps] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const carouselRef = useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [carouselLayout, setCarouselLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [signInCardHeight, setSignInCardHeight] = useState(0);

  const PILL_1_SIZE = 256; // w-56
  const PILL_2_SIZE = 256; // w-64
  const pill1X = useSharedValue(0);
  const pill1Y = useSharedValue(0);
  const pill2X = useSharedValue(0);
  const pill2Y = useSharedValue(0);
  const cardProgress = useSharedValue(completedSteps ? 1 : 0);

  useEffect(() => {
    const { width, height } = containerSize;
    if (!width || !height) return;

    // Target positions copied from the old static pills:
    // pill1: top-32 (-left-20) => top=128, left=-80
    // pill2: bottom-32 (-right-24) => bottom=128, right=-96
    const target1Left = -80;
    const target1Top = 138;

    const target2Right = -96;
    const target2Bottom = 128;
    const target2Left = width - PILL_2_SIZE - target2Right; // right can be negative
    const target2Top = height - target2Bottom - PILL_2_SIZE;

    const rootCenterX = width / 2;
    const rootCenterY = height / 2;

    // When the modal is NOT shown, the pills should be centered on the carousel container.
    const carouselCenterX = carouselLayout.x + carouselLayout.width / 2;
    const carouselCenterY = carouselLayout.y + carouselLayout.height / 2;
    const baseOffsetX =
      carouselLayout.width && carouselLayout.height
        ? carouselCenterX - rootCenterX
        : 0;
    const baseOffsetY =
      carouselLayout.width && carouselLayout.height
        ? carouselCenterY - rootCenterY
        : 0;

    const target1CenterX = target1Left + PILL_1_SIZE / 2;
    const target1CenterY = target1Top + PILL_1_SIZE / 2;
    const target2CenterX = target2Left + PILL_2_SIZE / 2;
    const target2CenterY = target2Top + PILL_2_SIZE / 2;

    const to1X = completedSteps ? target1CenterX - rootCenterX : baseOffsetX;
    const to1Y = completedSteps ? target1CenterY - rootCenterY : baseOffsetY;
    const to2X = completedSteps ? target2CenterX - rootCenterX : baseOffsetX;
    const to2Y = completedSteps ? target2CenterY - rootCenterY : baseOffsetY;

    const config = { duration: 550, easing: Easing.out(Easing.cubic) };
    pill1X.value = withTiming(to1X, config);
    pill1Y.value = withTiming(to1Y, config);
    pill2X.value = withTiming(to2X, config);
    pill2Y.value = withTiming(to2Y, config);
  }, [
    completedSteps,
    containerSize.height,
    containerSize.width,
    carouselLayout.x,
    carouselLayout.y,
    carouselLayout.width,
    carouselLayout.height,
  ]);

  useEffect(() => {
    cardProgress.value = withTiming(completedSteps ? 1 : 0, {
      duration: 550,
      easing: Easing.out(Easing.cubic),
    });
  }, [completedSteps]);

  const pill1Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: -PILL_1_SIZE / 2 },
      { translateY: -PILL_1_SIZE / 2 },
      { translateX: pill1X.value },
      { translateY: pill1Y.value },
    ],
  }));

  const pill2Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: -PILL_2_SIZE / 2 },
      { translateY: -PILL_2_SIZE / 2 },
      { translateX: pill2X.value },
      { translateY: pill2Y.value },
    ],
  }));

  const offscreenY = containerSize.height ? containerSize.height + 200 : 1000;

  const onboardingCardAnimStyle = useAnimatedStyle(() => {
    // 0 = onboarding card visible, 1 = it has fallen off screen
    const translateY = interpolate(
      cardProgress.value,
      [0, 1],
      [0, offscreenY],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      cardProgress.value,
      [0, 0.6, 1],
      [1, 0.35, 0],
      Extrapolation.CLAMP
    );
    return { transform: [{ translateY }], opacity };
  }, [offscreenY]);

  const signInCardAnimStyle = useAnimatedStyle(() => {
    // 0 = off screen, 1 = visible
    const translateY = interpolate(
      cardProgress.value,
      [0, 1],
      [offscreenY, 0],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      cardProgress.value,
      [0, 0.4, 1],
      [0, 0.5, 1],
      Extrapolation.CLAMP
    );
    // Center horizontally: translate by -50% of card width
    const cardWidth = containerSize.width ? containerSize.width - 32 : 0;
    const translateX = cardWidth ? -cardWidth / 2 : 0;
    // Center vertically: translate by -50% of card height
    const baseTranslateY = signInCardHeight ? -signInCardHeight / 2 : 0;
    return {
      transform: [{ translateX }, { translateY: baseTranslateY + translateY }],
      opacity,
    };
  }, [offscreenY, containerSize.width, signInCardHeight]);

  const handleNext = () => {
    if (isLastStep) {
      setCompletedSteps(true);
      return;
    }

    const nextIndex = currentStep + 1;
    setCurrentStep(nextIndex);
    carouselRef.current?.scrollTo({ index: nextIndex, animated: true });
  };

  const handleSkip = () => {
    setCompletedSteps(true);
  };

  const onSnapToItem = (index: number) => {
    setCurrentStep(index);
  };

  const onPressPagination = (index: number) => {
    carouselRef.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  const handleClose = () => {
    setCompletedSteps(false);
  };

  const handleEmailSignIn = () => {
    // TODO: Navigate to email sign-in flow
  };

  const handleAppleSignIn = () => {
    // TODO: Implement Apple sign-in
    router.replace("/");
  };

  const handleGoogleSignIn = () => {
    // TODO: Implement Google sign-in
    router.replace("/");
  };

  return (
    <View
      className="bg-main relative flex-1 p-4 py-6"
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setContainerSize({ width, height });
      }}
    >
      {/* Animated background pills */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            top: containerSize.height / 2,
            left: containerSize.width / 2,
            width: PILL_1_SIZE,
            height: PILL_1_SIZE,
            zIndex: 0,
          },
          pill1Style,
        ]}
      >
        <Image
          source={require("@/assets/pill.png")}
          resizeMode="contain"
          className="h-full w-full"
        />
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            top: containerSize.height / 2,
            left: containerSize.width / 2,
            width: PILL_2_SIZE,
            height: PILL_2_SIZE,
            zIndex: 0,
          },
          pill2Style,
        ]}
      >
        <Image
          source={require("@/assets/pill.png")}
          resizeMode="contain"
          className="h-full w-full"
        />
      </Animated.View>

      <View
        className="relative flex-1 justify-center"
        onLayout={(e) => {
          const { x, y, width, height } = e.nativeEvent.layout;
          setCarouselLayout({ x, y, width, height });
        }}
      >
        <Carousel
          ref={carouselRef}
          width={screenWidth}
          data={steps}
          renderItem={({ item }) => (
            <View className="flex-1 items-center justify-center"></View>
          )}
          onSnapToItem={onSnapToItem}
          onProgressChange={(offsetProgress, absoluteProgress) => {
            progress.value = absoluteProgress;
          }}
          enabled={true}
          loop={false}
        />
      </View>

      <Animated.View
        pointerEvents={completedSteps ? "none" : "auto"}
        style={[onboardingCardAnimStyle]}
        className="bg-background-day dark:bg-background-night relative w-full rounded-4xl px-4 py-10"
      >
        <SafeAreaView edges={[]} className="flex-1">
          <View className="flex-row items-start justify-start">
            <Pagination.Custom
              progress={progress}
              data={steps}
              size={8}
              dotStyle={{
                borderRadius: 4,
                backgroundColor: "#0000000f",
              }}
              activeDotStyle={{
                borderRadius: 4,
                width: 32,
                height: 8,
                overflow: "hidden",
                backgroundColor: "#72D000",
              }}
              containerStyle={{
                gap: 5,
                alignItems: "center",
                height: 8,
              }}
              horizontal
              onPress={onPressPagination}
              customReanimatedStyle={(progress, index, length) => {
                let val = Math.abs(progress - index);
                if (index === 0 && progress > length - 1) {
                  val = Math.abs(progress - length);
                }

                return {
                  transform: [
                    {
                      translateY: interpolate(
                        val,
                        [0, 1],
                        [0, 0],
                        Extrapolation.CLAMP
                      ),
                    },
                  ],
                };
              }}
            />
          </View>
          <View className="my-6 gap-2">
            <Text className="text-text-day dark:text-text-night text-xl leading-tight font-semibold">
              {currentStepData.title}
            </Text>
            <Text className="text-text-day dark:text-text-night text-base leading-tight">
              {currentStepData.description}
            </Text>
          </View>
          <View className="flex-row justify-between gap-2">
            <CustomButton
              className="flex-1"
              intent="secondary"
              onPress={handleSkip}
            >
              Skip
            </CustomButton>
            <CustomButton className="flex-1" onPress={handleNext}>
              {isLastStep ? "Finish" : "Next"}
            </CustomButton>
          </View>
        </SafeAreaView>
      </Animated.View>

      <Animated.View
        pointerEvents={completedSteps ? "auto" : "none"}
        style={[
          {
            position: "absolute",
            top: containerSize.height / 2,
            left: containerSize.width / 2,
            width: Math.max((containerSize.width || 0) - 32, 0),
          },
          signInCardAnimStyle,
        ]}
      >
        <View
          className="z-10 rounded-4xl bg-white px-6 py-8 opacity-100 shadow-sm"
          onLayout={(e) => {
            const { height } = e.nativeEvent.layout;
            setSignInCardHeight(height);
          }}
        >
          {/* Close button */}
          <View className="mb-4 items-end">
            <Button
              onPress={handleClose}
              className="h-8 w-8 rounded-full"
              accessibilityLabel="Close"
              variant="tertiary"
            >
              <XIcon />
            </Button>
          </View>

          {/* Heading */}
          <View className="mb-6">
            <Text className="mb-2 text-2xl font-semibold">
              Welcome to TaskNest!
            </Text>
            <Text className="text-hint text-base leading-snug">
              Create tasks, share responsibilities, and keep your family life
              running smoothly — all in one place.
            </Text>
          </View>

          {/* Primary sign-in button */}
          <Link href="/auth/sign-in" asChild>
            <CustomButton
              className="mt-1 w-full bg-black"
              labelClassName="text-white"
              onPress={handleEmailSignIn}
            >
              Sign in
            </CustomButton>
          </Link>

          {/* Continue with email */}
          <Link href="/auth/email-auth" asChild>
            <Button
              variant="tertiary"
              className="mt-3 w-full rounded-xl"
              onPress={handleEmailSignIn}
            >
              Continue with Email
            </Button>
          </Link>

          {/* Social sign-in options */}
          <View className="mt-4 flex-row gap-3">
            <Button
              variant="tertiary"
              className="flex-1 rounded-xl"
              onPress={handleAppleSignIn}
            >
              <AppleIcon />
            </Button>
            <Button
              variant="tertiary"
              className="flex-1 rounded-xl"
              onPress={handleGoogleSignIn}
            >
              <GoogleIcon />
            </Button>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

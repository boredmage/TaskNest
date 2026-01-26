import { StatusBar } from "expo-status-bar";
import { Text, View, Image, Dimensions } from "react-native";
import { useState, useRef } from "react";
import { useSharedValue, interpolate, Extrapolation } from "react-native-reanimated";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import { CustomButton } from '../components/custom-button';

const { width: screenWidth } = Dimensions.get('window');

const slide1 = require('../assets/onboarding/slide-1.png');
const slide2 = require('../assets/onboarding/slide-2.png');
const slide3 = require('../assets/onboarding/slide-3.png');

const steps = [
  {
    title: 'Organize as a Family',
    description: 'Assign chores and stay on the same page — your family, working as one team.',
    image: slide1,
  },
  {
    title: 'Stay in Sync',
    description: 'Get notified when tasks are done and see changes instantly.',
    image: slide2,
  },
  {
    title: 'One Place for Everything',
    description: 'Groceries, events, and plans — manage it all in one app.',
    image: slide3,
  },
]

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const carouselRef = useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      const nextIndex = currentStep + 1;
      setCurrentStep(nextIndex);
      carouselRef.current?.scrollTo({ index: nextIndex, animated: true });
    }
  };

  const handleSkip = () => {
    const lastIndex = steps.length - 1;
    setCurrentStep(lastIndex);
    carouselRef.current?.scrollTo({ index: lastIndex, animated: true });
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

  return (
    <View className="flex-1 bg-primary p-4">
      <View className="flex-1 justify-center">
        <Carousel
          ref={carouselRef}
          width={screenWidth}
          height={screenWidth * 1.2}
          data={steps}
          renderItem={({ item }) => (
            <View className="flex-1 items-center justify-center">
              <Image
                source={item.image}
                className="w-full h-full"
                resizeMode="contain"
              />
            </View>
          )}
          onSnapToItem={onSnapToItem}
          onProgressChange={(offsetProgress, absoluteProgress) => {
            progress.value = absoluteProgress;
          }}
          enabled={true}
          loop={false}
        />
      </View>

      <View className='w-full bg-white rounded-4xl px-4 py-10 relative'>
        <View className='items-start justify-start flex-row'>
          <Pagination.Custom
            progress={progress}
            data={steps}
            size={8}
            dotStyle={{
              borderRadius: 4,
              backgroundColor: '#0000000f',
            }}
            activeDotStyle={{
              borderRadius: 4,
              width: 32,
              height: 8,
              overflow: "hidden",
              backgroundColor: '#72D000',
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
                      Extrapolation.CLAMP,
                    ),
                  },
                ],
              };
            }}
          />
        </View>
        <View className='gap-2 my-6'>
          <Text className='text-xl font-semibold leading-tight'>{currentStepData.title}</Text>
          <Text className='text-base leading-tight'>{currentStepData.description}</Text>
        </View>
        <View className='flex-row justify-between gap-2'>
          <CustomButton className='flex-1' intent='secondary' onPress={handleSkip}>
            Skip
          </CustomButton>
          <CustomButton className='flex-1' onPress={handleNext}>
            {isLastStep ? 'Finish' : 'Next'}
          </CustomButton>
        </View>
      </View>

      <StatusBar style="dark" />
    </View>
  );
}

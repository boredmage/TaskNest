import { BottomSheet, useBottomSheetAnimation } from 'heroui-native';
import { StyleSheet } from 'react-native';
import {
  interpolate, useDerivedValue,
} from 'react-native-reanimated';
import AnimatedBlurView from '../animated-blur-view';

export const BottomSheetBlurOverlay = () => {
  const { progress } = useBottomSheetAnimation();

  const blurIntensity = useDerivedValue(() => {
    return interpolate(progress.get(), [0, 1, 2], [0, 40, 0]);
  });

  return (
    <BottomSheet.Close style={StyleSheet.absoluteFill}>
      <AnimatedBlurView
        blurIntensity={blurIntensity}
        tint='systemUltraThinMaterialDark'
        style={StyleSheet.absoluteFill}
      />
    </BottomSheet.Close>
  );
};


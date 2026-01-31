import Animated, {
  type SharedValue,
  useAnimatedProps,
} from 'react-native-reanimated';
import { BlurView, type BlurViewProps } from 'expo-blur';

const RBlurView = Animated.createAnimatedComponent(BlurView);

interface AnimatedBlurViewProps extends BlurViewProps {
  blurIntensity: SharedValue<number>;
}

const AnimatedBlurView = ({ blurIntensity, ...props }: AnimatedBlurViewProps) => {
  const animatedProps = useAnimatedProps(() => {
    return {
      intensity: blurIntensity.get(),
    };
  });

  return <RBlurView animatedProps={animatedProps} {...props} />;
};

export default AnimatedBlurView;
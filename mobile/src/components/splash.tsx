import { spinner } from "@/assets/onboarding/doodles";
import { TiltWarp_400Regular, useFonts } from "@expo-google-fonts/tilt-warp";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { SvgXml } from "react-native-svg";

/**
 * Full-screen loading view (Figma 2:371) shown while the persisted session is
 * restored. Same green as the native splash, so the hand-off is seamless.
 */
export function Splash() {
  const [fontLoaded] = useFonts({ TiltWarp_400Regular });
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1400, easing: Easing.linear }),
      -1
    );
  }, []);

  const spin = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View
      exiting={FadeOut.duration(350)}
      style={StyleSheet.absoluteFill}
    >
      <View className="bg-main flex-1 items-center justify-center">
        <Text
          className="text-[36px] text-white"
          style={{
            fontFamily: fontLoaded ? "TiltWarp_400Regular" : undefined,
            fontWeight: fontLoaded ? undefined : "800",
          }}
        >
          Task<Text className="text-[#FFF457]">Nest.</Text>
        </Text>
        <View className="absolute bottom-[12%]">
          <Animated.View style={spin}>
            <SvgXml xml={spinner.xml} width={48} height={48} />
          </Animated.View>
        </View>
      </View>
    </Animated.View>
  );
}

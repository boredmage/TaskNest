import { CheckmarkLoader } from "@/components/checkmark-loader";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
  type FlatListProps,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

/** How far (pt) the list must be pulled past the top to trigger a refresh. */
const PULL_THRESHOLD = 64;
/** Space (pt) kept above the content for the loader while refreshing. */
const LOADER_SPACE = 56;
const LOADER_SIZE = 36;
const LOADER_REST_Y = (LOADER_SPACE - LOADER_SIZE) / 2;

type Props<T> = Omit<
  FlatListProps<T>,
  "refreshControl" | "onRefresh" | "CellRendererComponent"
> & {
  refreshing: boolean;
  onRefresh: () => void;
};

/**
 * FlatList whose pull-to-refresh shows the checkmark loader and nothing else.
 *
 * iOS: no native RefreshControl. The scroll view's bounce is the gesture and
 * everything is tracked on the UI thread: the loader's ring draws in step
 * with the pull and releasing past PULL_THRESHOLD calls `onRefresh`. While
 * `refreshing`, a top content inset holds the list below the loader (as the
 * native control does) so the content settles down rather than springing
 * back up first.
 *
 * Android has no overscroll bounce, so it keeps a native RefreshControl
 * (drawn invisible) purely to drive the gesture.
 */
export function RefreshableFlatList<T>(props: Props<T>) {
  return Platform.OS === "ios" ? (
    <IosRefreshableFlatList {...props} />
  ) : (
    <AndroidRefreshableFlatList {...props} />
  );
}

function IosRefreshableFlatList<T>({
  refreshing,
  onRefresh,
  ...props
}: Props<T>) {
  const listRef = useRef<FlatList<T>>(null);
  const offsetY = useSharedValue(0); // raw contentOffset.y (negative when pulled)
  const pull = useSharedValue(0); // pt pulled past the top, >= 0
  const pastThreshold = useSharedValue(false);
  const isRefreshing = useSharedValue(refreshing);
  // Content inset that holds the list below the loader while refreshing.
  // Kept in state (not derived from `refreshing`) so it can be removed only
  // after the list has scrolled back up, avoiding a jump.
  const [insetTop, setInsetTop] = useState(refreshing ? LOADER_SPACE : 0);

  useEffect(() => {
    isRefreshing.value = refreshing;
    if (refreshing) {
      // From a pull the scroll view is mid-bounce and settles at the new
      // inset on its own, so the content never springs back up first.
      setInsetTop(LOADER_SPACE);
      return;
    }
    // Finished: if the list is still held down, scroll it home first, then
    // drop the inset once the scroll has landed.
    if (offsetY.value < 0) {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
      const timer = setTimeout(() => setInsetTop(0), 300);
      return () => clearTimeout(timer);
    }
    setInsetTop(0);
  }, [refreshing, isRefreshing, offsetY]);

  // Once the inset has been committed natively, slide the content down to it
  // for refreshes that didn't come from a pull (fetch on mount, programmatic).
  // Issued in the same tick as the inset, the scroll would be clamped to 0.
  useEffect(() => {
    if (insetTop !== LOADER_SPACE || offsetY.value < 0) return;
    const frame = requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({
        offset: -LOADER_SPACE,
        animated: true,
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [insetTop, offsetY]);

  const haptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const scrollHandler = useAnimatedScrollHandler(
    {
      onScroll: (e) => {
        const y = e.contentOffset.y;
        offsetY.value = y;
        pull.value = y < 0 ? -y : 0;
        const past = -y >= PULL_THRESHOLD;
        if (past !== pastThreshold.value) {
          pastThreshold.value = past;
          if (past && !isRefreshing.value) runOnJS(haptic)();
        }
      },
      onEndDrag: () => {
        if (pastThreshold.value && !isRefreshing.value) runOnJS(onRefresh)();
        pastThreshold.value = false;
      },
    },
    [onRefresh]
  );

  const progress = useDerivedValue(() =>
    Math.min(pull.value / PULL_THRESHOLD, 1)
  );

  const loaderStyle = useAnimatedStyle(() => {
    if (isRefreshing.value) {
      return {
        opacity: withTiming(1, { duration: 120 }),
        transform: [
          { translateY: withTiming(LOADER_REST_Y, { duration: 220 }) },
          { scale: withTiming(1, { duration: 120 }) },
        ],
      };
    }
    const p = progress.value;
    if (pull.value <= 0) {
      return {
        opacity: withTiming(0, { duration: 160 }),
        transform: [{ translateY: LOADER_REST_Y }, { scale: 0.7 }],
      };
    }
    // Follow the finger: sit centred in the pulled-open area.
    return {
      opacity: p,
      transform: [
        { translateY: pull.value / 2 - LOADER_SIZE / 2 },
        { scale: 0.7 + 0.3 * p },
      ],
    };
  });

  return (
    <View style={styles.wrapper}>
      <Animated.FlatList
        {...props}
        ref={listRef}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentInset={{ top: insetTop }}
        contentInsetAdjustmentBehavior="never"
      />
      <Animated.View pointerEvents="none" style={[styles.overlay, loaderStyle]}>
        <CheckmarkLoader
          size={LOADER_SIZE}
          progress={progress}
          active={refreshing}
        />
      </Animated.View>
    </View>
  );
}

function AndroidRefreshableFlatList<T>({
  refreshing,
  onRefresh,
  ...props
}: Props<T>) {
  return (
    <View style={styles.wrapper}>
      <FlatList
        {...props}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["transparent"]}
            progressBackgroundColor="transparent"
          />
        }
      />
      {refreshing ? (
        <View
          pointerEvents="none"
          style={[styles.overlay, { top: LOADER_REST_Y }]}
        >
          <CheckmarkLoader size={LOADER_SIZE} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },
});

export default RefreshableFlatList;

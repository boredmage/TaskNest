import { requireOptionalNativeModule } from "expo-modules-core";

type ScreenCornersNative = { getBottomCornerRadius(): number };

const native =
  requireOptionalNativeModule<ScreenCornersNative>("ScreenCorners");

/**
 * Radius (in points) of the device screen's bottom corners, or 0 when the
 * screen has square corners or the native module isn't in this build.
 */
export function getScreenBottomCornerRadius(): number {
  try {
    const value = native?.getBottomCornerRadius() ?? 0;
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

import { getScreenBottomCornerRadius } from "../../modules/screen-corners";

/** Gap between any bottom sheet and the screen edge, on all sides. */
export const SHEET_GAP = 9.5;
/** Top corner radius shared by every sheet. */
export const SHEET_RADIUS = 20;

/**
 * Corner radii for a sheet that hugs the bottom of the screen: normal top
 * corners, and bottom corners concentric with the device's rounded screen
 * (its radius minus the gap) so the sheet reads as part of the bezel.
 * Square-cornered screens just get the normal radius.
 */
export function useSheetCorners() {
  const screenRadius = getScreenBottomCornerRadius();
  const bottomRadius =
    screenRadius > SHEET_GAP ? screenRadius - SHEET_GAP : SHEET_RADIUS;
  return {
    borderTopLeftRadius: SHEET_RADIUS,
    borderTopRightRadius: SHEET_RADIUS,
    borderBottomLeftRadius: bottomRadius,
    borderBottomRightRadius: bottomRadius,
  };
}

/** Full layout for an inline card at the bottom of a screen (onboarding). */
export function useSheetCardStyle() {
  return {
    ...useSheetCorners(),
    marginHorizontal: SHEET_GAP,
    marginBottom: SHEET_GAP,
    overflow: "hidden" as const,
  };
}

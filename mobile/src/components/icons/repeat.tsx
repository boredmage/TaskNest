import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

/** Tabler "repeat" (outline). Colour via the `color` prop. */
const RepeatIcon = (props: SvgProps) => (
  <Svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <Path d="M4 12v-3a3 3 0 0 1 3-3h13m-3-3 3 3-3 3" />
    <Path d="M20 12v3a3 3 0 0 1-3 3H4m3 3-3-3 3-3" />
  </Svg>
);
export default RepeatIcon;

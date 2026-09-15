import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const Moon = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M11.806 6.931a8 8 0 0 1 4.61-2.773 9 9 0 0 0-10.78 1.478 9 9 0 0 0 10.78 14.207 8 8 0 0 1-4.61-12.912"
      fill="#72d000"
    />
    <Path
      d="M16.418 4.157h-.003m.003 15.686h-.003m0-15.685a8 8 0 0 0 0 15.685m0-15.685A9 9 0 0 0 12 3a9 9 0 1 0 4.415 16.843m0-15.685a9 9 0 0 1 0 15.685"
      stroke="#72d000"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default Moon;

import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const BagIcon = (props: SvgProps) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
    <Path
      d="M5.276 6.667h9.45a1.667 1.667 0 0 1 1.647 1.92l-1.046 6.793a2.5 2.5 0 0 1-2.472 2.12h-5.71a2.5 2.5 0 0 1-2.47-2.12L3.629 8.586a1.667 1.667 0 0 1 1.647-1.92"
      fill="#ff48e7"
      stroke="#ff48e7"
      strokeWidth={1.667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7.5 9.167V5a2.5 2.5 0 1 1 5 0v4.167"
      stroke="#ff48e7"
      strokeWidth={1.667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default BagIcon;

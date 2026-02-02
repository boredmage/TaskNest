import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const PlaneIcon = (props: SvgProps) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
    <Path
      d="M13.334 8.333h3.333a1.667 1.667 0 0 1 0 3.334h-3.333L10 17.5H7.5l1.667-5.833H5.834l-1.667 1.666h-2.5L3.334 10 1.667 6.667h2.5l1.667 1.666h3.333L7.5 2.5H10z"
      fill="#3cc700"
      stroke="#3cc700"
      strokeWidth={1.667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default PlaneIcon;

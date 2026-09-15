import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

const XIcon = (props: SvgProps) => (
  <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
    <Path
      d="m12 4-8 8m0-8 8 8"
      stroke="#a0a0a0"
      strokeWidth={1.333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default XIcon;

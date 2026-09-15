import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const ChevronRight = (props: SvgProps) => (
  <Svg width={7} height={12} viewBox="0 0 7 12" fill="none" {...props}>
    <Path
      d="m1 1 5 5-5 5"
      stroke="#a0a0a0"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default ChevronRight;

import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

const TrophyIcon = (props: SvgProps) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
    <Path
      d="M14.167 2.5a.833.833 0 0 1 .827.736l.006.097v1.809a2.5 2.5 0 1 1 0 4.716V10a5 5 0 0 1-4.167 4.93v1.737h2.5a.833.833 0 0 1 .098 1.66l-.098.006H6.667a.833.833 0 0 1-.098-1.66l.098-.006h2.5V14.93a5 5 0 0 1-4.164-4.743L5 10v-.143a2.5 2.5 0 0 1-3.33-2.21L1.667 7.5l.005-.147A2.5 2.5 0 0 1 5 5.142V3.333a.833.833 0 0 1 .833-.833zm-10 4.167a.833.833 0 1 0 0 1.666.833.833 0 0 0 0-1.666m11.666 0a.833.833 0 1 0 0 1.666.833.833 0 0 0 0-1.666"
      fill="#fff"
    />
  </Svg>
);
export default TrophyIcon;

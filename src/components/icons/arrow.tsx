import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

const Arrow = (props: SvgProps) => (
  <Svg width={28} height={28} viewBox="0 0 28 28" fill="none" {...props}>
    <Path
      d="M5.833 14h16.334M5.833 14l7 7m-7-7 7-7"
      stroke={props.stroke || "#1b1b1b"}
      strokeWidth={2.333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default Arrow;

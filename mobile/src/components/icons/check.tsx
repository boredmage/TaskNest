import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

/** Tabler "check" (filled). Pass `fill` to recolour; defaults to the main green. */
const Check = ({ fill = "#72d000", ...props }: SvgProps) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill={fill} {...props}>
    <Path d="M20.707 6.293a1 1 0 0 1 0 1.414l-10 10a1 1 0 0 1-1.414 0l-5-5a1 1 0 0 1 1.414-1.414l4.293 4.293 9.293-9.293a1 1 0 0 1 1.414 0" />
  </Svg>
);
export default Check;

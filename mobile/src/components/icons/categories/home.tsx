import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

/** Household category — the same house glyph as the Family tab, in category blue. */
const HomeIcon = ({ fill = "#006aff", ...props }: SvgProps) => (
  <Svg width={20} height={20} viewBox="11 11 106 106" fill="none" {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M108 83V56.8583C108 48.5939 103.748 40.9109 96.7451 36.5221L76.7451 23.9877C68.9505 19.1026 59.0495 19.1026 51.2549 23.9877L31.2549 36.5221C24.2521 40.9109 20 48.5939 20 56.8583V83C20 96.2548 30.7452 107 44 107H50.3111H77.6889H84C97.2548 107 108 96.2548 108 83ZM54 79.5H74A3.5 3.5 0 0 1 74 86.5H54A3.5 3.5 0 0 1 54 79.5Z"
      fill={fill}
    />
  </Svg>
);
export default HomeIcon;

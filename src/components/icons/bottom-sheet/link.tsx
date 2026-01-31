import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const Link = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <Path
      d="m9 15 6-6m-4-3 .463-.536a5 5 0 0 1 7.071 7.072L18 13m-5 5-.397.534a5.07 5.07 0 0 1-7.127 0 4.97 4.97 0 0 1 0-7.071L6 11"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default Link;

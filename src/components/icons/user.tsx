import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const User = (props: SvgProps) => (
  <Svg viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10m8.59 10c0-3.87-3.85-7-8.59-7s-8.59 3.13-8.59 7"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default User;

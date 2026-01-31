import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

const Check = (props: SvgProps) => (
  <Svg
    width={15}
    height={15}
    viewBox="0 0 15 15"
    fill="none"
    {...props}
  >
    <Path
      d="m1.165 8.165 4.332 5.294c.083.102.24.093.311-.018l7.857-12.276"
      stroke="#72d000"
      strokeWidth={2.33}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default Check;

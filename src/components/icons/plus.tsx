import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

const PlusIcon = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <Path
      d="M12 5v14m-7-7h14"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default PlusIcon;

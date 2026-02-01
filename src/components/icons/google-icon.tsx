import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const GoogleIcon = (props: SvgProps) => (
  <Svg width={17} height={17} viewBox="0 0 17 17" fill="none" {...props}>
    <Path
      d="M8.333 0a8.3 8.3 0 0 1 5.242 1.855.834.834 0 0 1 .033 1.267L12.35 4.257a.83.83 0 0 1-1.054.05 5 5 0 1 0 1.752 5.696L13.05 10H10a.833.833 0 0 1-.827-.736l-.005-.097V7.5A.833.833 0 0 1 10 6.667h5.788a.833.833 0 0 1 .828.741q.05.46.05.925A8.333 8.333 0 1 1 8.334 0"
      fill="#1b1b1b"
    />
  </Svg>
);
export default GoogleIcon;

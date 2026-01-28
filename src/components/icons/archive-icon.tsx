import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

const ArchiveIcon = (props: SvgProps) => (
  <Svg
    width={20}
    height={20}
    viewBox="0 0 20 20"
    fill="none"
    {...props}
  >
    <Path
      d="M1.667 4.167A1.667 1.667 0 0 1 3.333 2.5h13.334a1.667 1.667 0 1 1 0 3.333H3.332a1.667 1.667 0 0 1-1.666-1.666M15.834 7.5c.427 0 .78.386.827.883l.006.117v6c0 1.598-1.041 2.903-2.354 2.995l-.146.005H5.834c-1.332 0-2.42-1.25-2.496-2.823l-.005-.177v-6c0-.553.374-1 .834-1zm-4.167 1.667H8.334l-.098.005a.833.833 0 0 0 0 1.656l.098.005h3.333l.097-.005a.833.833 0 0 0 0-1.655z"
      fill="#fff"
    />
  </Svg>
);
export default ArchiveIcon;

import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const SettingsOutline = (props: SvgProps) => (
  <Svg width={28} height={28} viewBox="0 0 28 28" fill="none" {...props}>
    <Path
      d="M12.046 5.037c.497-2.05 3.411-2.05 3.908 0a2.01 2.01 0 0 0 3.002 1.243c1.8-1.096 3.862.964 2.765 2.765a2.013 2.013 0 0 0 1.242 3c2.05.498 2.05 3.412 0 3.91a2.01 2.01 0 0 0-1.243 3.001c1.097 1.8-.964 3.862-2.765 2.765a2.012 2.012 0 0 0-3 1.242c-.498 2.05-3.412 2.05-3.91 0a2.01 2.01 0 0 0-3.001-1.243c-1.8 1.097-3.862-.964-2.765-2.765a2.01 2.01 0 0 0-1.242-3c-2.05-.498-2.05-3.412 0-3.91a2.01 2.01 0 0 0 1.243-3c-1.096-1.8.964-3.862 2.765-2.765a2.01 2.01 0 0 0 3-1.242"
      stroke="#1b1b1b"
      strokeWidth={2.333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10.5 14a3.5 3.5 0 1 0 7 0 3.5 3.5 0 0 0-7 0"
      stroke="#1b1b1b"
      strokeWidth={2.333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default SettingsOutline;

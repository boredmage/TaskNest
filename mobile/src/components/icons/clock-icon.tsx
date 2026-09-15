import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

const ClockIcon = (props: SvgProps) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
    <Path
      d="M14.167 2.783A8.334 8.334 0 1 1 1.666 10l.004-.27a8.333 8.333 0 0 1 12.496-6.947m-5 3.05v4.185l.002.045.017.113.004.02a1 1 0 0 0 .046.138l.034.069.052.082.058.072.062.062.079.063.066.043.059.03.11.042.112.025.069.009.103.002.094-.01.09-.02.088-.03.09-.043.055-.033 2.505-1.67a.833.833 0 1 0-.925-1.387l-1.204.802V5.833a.834.834 0 0 0-.736-.827L10 5a.833.833 0 0 0-.834.833"
      fill="#fff"
    />
  </Svg>
);
export default ClockIcon;

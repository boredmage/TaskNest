import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const Pin = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="m15.113 3.21.094.083 5.5 5.5a1 1 0 0 1-1.175 1.59l-3.172 3.17-1.424 3.798a1 1 0 0 1-.158.277l-.07.08-1.5 1.5a1 1 0 0 1-1.32.082l-.095-.083L9 16.415l-3.793 3.792a1 1 0 0 1-1.497-1.32l.083-.094L7.585 15l-2.792-2.793a1 1 0 0 1-.083-1.32l.083-.094 1.5-1.5a1 1 0 0 1 .258-.187l.098-.042 3.796-1.425 3.17-3.17a1 1 0 0 1 1.498-1.26"
      fill="#fff"
    />
  </Svg>
);
export default Pin;

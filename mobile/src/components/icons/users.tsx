import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const UsersIcon = (props: SvgProps) => (
  <Svg width={28} height={28} viewBox="0 0 28 28" fill="none" {...props}>
    <Path
      d="M5.25 7.438a4.813 4.813 0 1 1 9.625 0 4.813 4.813 0 0 1-9.625 0m11.375 2.625a3.937 3.937 0 1 1 7.874 0 3.937 3.937 0 0 1-7.874 0M1.75 22.313a8.312 8.312 0 0 1 16.625 0v.003l-.001.139a.87.87 0 0 1-.424.735 15.24 15.24 0 0 1-7.887 2.185c-2.885 0-5.584-.798-7.887-2.185a.88.88 0 0 1-.425-.735zm18.375.003-.001.168a2.64 2.64 0 0 1-.272 1.12c2.037.126 4.071-.28 5.903-1.178a.88.88 0 0 0 .49-.75 5.687 5.687 0 0 0-8.116-5.38 10 10 0 0 1 1.995 6.017z"
      fill="currentColor"
    />
  </Svg>
);
export default UsersIcon;

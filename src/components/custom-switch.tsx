import { Switch } from "heroui-native";
import type { SwitchProps } from "heroui-native";
import { useColorScheme } from "react-native";

interface CustomSwitchProps extends Omit<SwitchProps, "className" | "animation"> {
  value: boolean;
  onValueChange: (value: boolean) => void;
  size?: "small" | "medium" | "large";
}

const sizeClasses = {
  small: {
    container: "w-[44px] h-[26px]",
    thumb: "size-4",
    left: 3,
  },
  medium: {
    container: "w-[48px] h-[28px]",
    thumb: "size-5",
    left: 3,
  },
  large: {
    container: "w-[56px] h-[32px]",
    thumb: "size-6",
    left: 4,
  },
};

export function CustomSwitch({
  value,
  onValueChange,
  size = "medium",
  ...props
}: CustomSwitchProps) {
  const sizeConfig = sizeClasses[size];
  const isDarkTheme = useColorScheme() === 'dark';

  return (
    <Switch
      className={sizeConfig.container}
      isSelected={value}
      onSelectedChange={onValueChange}
      animation={{
        backgroundColor: {
          value: [isDarkTheme ? "#78788029" : "#E5E5E5", "#72D000"],
        },
      }}
      {...props}
    >
      <Switch.Thumb
        className={`${sizeConfig.thumb} bg-white rounded-full`}
        animation={{
          left: {
            value: sizeConfig.left,
            springConfig: {
              damping: 30,
              stiffness: 300,
              mass: 1,
            },
          },
        }}
      />
    </Switch>
  );
}

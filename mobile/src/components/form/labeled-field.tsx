import ChevronRight from "@/components/icons/chevron-right";
import { useAppTheme } from "@/contexts/app-theme-context";
import { cn } from "heroui-native";
import {
  Pressable,
  Text,
  TextInput,
  View,
  type PressableProps,
  type TextInputProps,
} from "react-native";

/** A label above a 50pt field (Figma 205:6390). */
export function LabeledField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-2">
      <Text className="text-text-day dark:text-text-night text-base font-medium">
        {label}
      </Text>
      {children}
    </View>
  );
}

const FIELD = "bg-transparent-day dark:bg-transparent-night rounded-xl px-4";

/** Plain text field in the form's field style. Multiline grows to 120pt. */
export function FieldInput({ className, multiline, ...props }: TextInputProps) {
  const { isDark } = useAppTheme();
  return (
    <TextInput
      placeholderTextColor="#A0A0A0"
      multiline={multiline}
      textAlignVertical={multiline ? "top" : "center"}
      className={cn(
        FIELD,
        "text-text-day dark:text-text-night",
        multiline ? "min-h-[120px] py-3" : "h-[50px]",
        className
      )}
      // Font metrics set here (not via text-base) so iOS centres a
      // single line inside the fixed 50pt box instead of sitting it high.
      style={{
        color: isDark ? "#FFFFFF" : "#1B1B1B",
        fontSize: 16,
        lineHeight: 20,
        paddingTop: multiline ? 12 : 0,
        paddingBottom: multiline ? 12 : 0,
        includeFontPadding: false,
      }}
      {...props}
    />
  );
}

/** A field that opens a picker; shows the chosen value on the right. */
export function FieldButton({
  value,
  placeholder,
  onPress,
  disabled,
  ...rest
}: {
  value?: string | null;
  placeholder: string;
  onPress?: () => void;
  disabled?: boolean;
} & Omit<PressableProps, "onPress" | "disabled">) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      {...rest}
      className={cn(
        FIELD,
        "h-[50px] flex-row items-center justify-between gap-3 active:opacity-80",
        disabled && "opacity-60"
      )}
    >
      <Text
        className={cn(
          "flex-1 text-base",
          value ? "text-text-day dark:text-text-night" : "text-hint"
        )}
        numberOfLines={1}
      >
        {value || placeholder}
      </Text>
      <ChevronRight />
    </Pressable>
  );
}

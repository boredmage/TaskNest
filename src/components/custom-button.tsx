import type { ButtonRootProps } from "heroui-native";
import { Button, cn } from "heroui-native";
import { tv, type VariantProps } from "tailwind-variants";

const customButtonVariants = tv({
  base: "font-semibold rounded-xl text-base disabled:bg-transparent-day disabled:opacity-100 disabled:text-red-500 group",
  variants: {
    intent: {
      primary: "bg-main",
      secondary: "bg-main-light",
      danger: "bg-red-500",
    },
  },
  defaultVariants: {
    intent: "primary",
  },
});

const customLabelVariants = tv({
  base: "text-hint",
  variants: {
    intent: {
      primary: "text-white",
      secondary: "text-main",
      danger: "text-white",
    },
  },
  defaultVariants: {
    intent: "primary",
  },
});

type CustomButtonVariants = VariantProps<typeof customButtonVariants>;

interface CustomButtonProps
  extends Omit<ButtonRootProps, "className" | "variant">, CustomButtonVariants {
  className?: string;
  labelClassName?: string;
}

export function CustomButton({
  intent,
  className,
  labelClassName,
  children,
  ...props
}: CustomButtonProps) {
  return (
    <Button
      pressableFeedbackVariant="highlight"
      pressableFeedbackHighlightProps={{
        animation: {
          backgroundColor: { value: "transparent" },
          opacity: { value: [1, 0] },
        },
      }}
      className={customButtonVariants({ intent, className })}
      {...props}
    >
      <Button.Label
        className={cn(
          customLabelVariants({ intent, className: labelClassName }),
          props.isDisabled && "text-hint"
        )}
      >
        {children}
      </Button.Label>
    </Button>
  );
}

import { Button } from 'heroui-native';
import type { ButtonRootProps } from 'heroui-native';
import { tv, type VariantProps } from 'tailwind-variants';
import { twMerge } from 'tailwind-merge';

const customButtonVariants = tv({
  base: 'font-semibold rounded-xl h-12 text-base disabled:bg-transparent-day disabled:opacity-100 disabled:text-red-500 group',
  variants: {
    intent: {
      primary: 'bg-primary',
      secondary: 'bg-secondary',
      danger: 'bg-red-500',
    },
  },
  defaultVariants: {
    intent: 'primary',
  },
});

const customLabelVariants = tv({
  base: 'text-hint-day',
  variants: {
    intent: {
      primary: 'text-white',
      secondary: 'text-primary',
      danger: 'text-white',
    },
  },
  defaultVariants: {
    intent: 'primary',
  },
});

type CustomButtonVariants = VariantProps<typeof customButtonVariants>;

interface CustomButtonProps
  extends Omit<ButtonRootProps, 'className' | 'variant'>,
  CustomButtonVariants {
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
          backgroundColor: { value: 'transparent' },
          opacity: { value: [1, 0] },
        },
      }}
      className={(customButtonVariants({ intent, className }))}
      {...props}
    >
      <Button.Label
        className={customLabelVariants({ intent, className: labelClassName })}
      >
        {children}
      </Button.Label>
    </Button>
  );
}
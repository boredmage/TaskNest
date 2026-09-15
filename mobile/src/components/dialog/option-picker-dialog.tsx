import CheckIcon from "@/components/icons/check";
import { cn, Dialog } from "heroui-native";
import { Pressable, Text, View } from "react-native";
import { DialogBlurBackdrop } from "./dialog-blur-backdrop";

export type PickerOption<T> = { value: T; label: string };

type OptionPickerDialogProps<T> = {
  title: string;
  options: PickerOption<T>[];
  value: T;
  onChange: (value: T) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Single-choice list in a dialog, used by the task form's picker fields. */
export function OptionPickerDialog<T extends string | number | null>({
  title,
  options,
  value,
  onChange,
  open,
  onOpenChange,
}: OptionPickerDialogProps<T>) {
  return (
    <Dialog isOpen={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <DialogBlurBackdrop />
        <Dialog.Content className="bg-primary-day dark:bg-primary-night gap-4 rounded-[20px] px-4 py-5">
          <Dialog.Title className="text-text-day dark:text-text-night text-xl font-semibold">
            {title}
          </Dialog.Title>
          <View>
            {options.map((option, index) => {
              const selected = option.value === value;
              return (
                <Pressable
                  key={String(option.value)}
                  onPress={() => {
                    onChange(option.value);
                    onOpenChange(false);
                  }}
                  className={cn(
                    "h-[50px] flex-row items-center justify-between active:opacity-70",
                    index < options.length - 1 && "border-b border-[#808080]/30"
                  )}
                >
                  <Text
                    className={cn(
                      "text-base",
                      selected
                        ? "text-main font-medium"
                        : "text-text-day dark:text-text-night"
                    )}
                  >
                    {option.label}
                  </Text>
                  {selected ? <CheckIcon width={20} height={20} /> : null}
                </Pressable>
              );
            })}
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

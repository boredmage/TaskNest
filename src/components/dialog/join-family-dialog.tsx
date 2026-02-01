import { CustomButton } from "@/components/custom-button";
import { Dialog, TextField } from "heroui-native";
import { View } from "react-native";
import { DialogBlurBackdrop } from "./dialog-blur-backdrop";

type JoinFamilyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function JoinFamilyDialog({
  open,
  onOpenChange,
}: JoinFamilyDialogProps) {
  return (
    <Dialog isOpen={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <DialogBlurBackdrop />
        <Dialog.Content className="bg-background-day dark:bg-background-night">
          <Dialog.Close className="bg-transparent-day dark:bg-transparent-night z-50 -mb-2 self-end rounded-full p-1.5" />

          <View className="gap-1.5">
            <Dialog.Title className="text-text-day dark:text-text-night text-2xl font-semibold">
              🔑 Join a Family
            </Dialog.Title>
            <Dialog.Description className="text-hint">
              To join your family, please enter the code that was sent to your
              mail.
            </Dialog.Description>
          </View>

          <TextField isRequired>
            <TextField.Input
              placeholder="Enter Code"
              className="bg-background-day dark:bg-background-night border-main text-main placeholder:text-main-light active:border-main focus:border-main mt-6 h-12 rounded-xl border-2 text-base leading-tight uppercase shadow-none"
            />
            <TextField.Description className="text-hint my-2 mb-4 text-xs">
              Haven't received the code? Check your spam folder or ask a family
              member to resend it.
            </TextField.Description>
          </TextField>

          <CustomButton className="px-6" onPress={() => onOpenChange(false)}>
            Submit
          </CustomButton>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

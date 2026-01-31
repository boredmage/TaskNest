import { View } from "react-native";
import { Dialog, TextField } from "heroui-native";
import { CustomButton } from "@/components/custom-button";
import { DialogBlurBackdrop } from "./dialog-blur-backdrop";

type JoinFamilyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function JoinFamilyDialog({ open, onOpenChange }: JoinFamilyDialogProps) {
  return (
    <Dialog isOpen={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <DialogBlurBackdrop />
        <Dialog.Content className="bg-background-day dark:bg-background-night">
          <Dialog.Close className="self-end -mb-2 z-50 bg-transparent-day dark:bg-transparent-night rounded-full p-1.5" />

          <View className="gap-1.5">
            <Dialog.Title className="text-2xl font-semibold text-text-day dark:text-text-night">
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
              className="rounded-xl bg-background-day dark:bg-background-night shadow-none h-12 text-base leading-tight mt-6 uppercase border-2 border-main text-main placeholder:text-main-light active:border-main focus:border-main"
            />
            <TextField.Description className="text-hint text-xs my-2 mb-4">
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

import { CustomButton } from "@/components/custom-button";
import { Dialog } from "heroui-native";
import { Share, View } from "react-native";
import UsersIcon from "../icons/users";
import { DialogBlurBackdrop } from "./dialog-blur-backdrop";

type FamilyCreatedSuccessDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  familyCode: string;
};

export function FamilyCreatedSuccessDialog({
  open,
  onOpenChange,
  familyCode,
}: FamilyCreatedSuccessDialogProps) {
  const handleShareFamilyCode = async () => {
    onOpenChange(false);

    try {
      await Share.share({
        title: "Share Family Code",
        message: `Join my family on TaskNest! Use this code: ${familyCode}`,
      });
    } catch (e) {
      console.warn("Failed to share family code", e);
    }
  };

  return (
    <Dialog isOpen={open} onOpenChange={onOpenChange} className="z-0">
      <Dialog.Portal>
        <DialogBlurBackdrop />
        <Dialog.Content className="bg-background-day dark:bg-background-night gap-6">
          <Dialog.Close className="bg-transparent-day dark:bg-transparent-night z-50 -mb-2 self-end rounded-full p-1.5" />

          <View className="bg-main size-20 flex-row items-center justify-center self-center rounded-full">
            <UsersIcon width={40} height={40} color="#FFFFFF" />
          </View>

          <View className="gap-1.5">
            <Dialog.Title className="text-text-day dark:text-text-night bg-transparent-day dark:bg-transparent-night rounded-xl p-2 text-center text-3xl font-semibold tracking-widest uppercase">
              {familyCode}
            </Dialog.Title>
            <Dialog.Description className="text-hint text-center text-sm">
              Your family code has been created successfully. You can now start
              adding tasks and invite members to your family.
            </Dialog.Description>
          </View>

          <CustomButton className="px-6" onPress={handleShareFamilyCode}>
            Share Family Code
          </CustomButton>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

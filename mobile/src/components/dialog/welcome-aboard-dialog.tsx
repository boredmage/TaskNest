import UsersIcon from "@/components/icons/users";
import { Dialog } from "heroui-native";
import { Pressable, Text, View } from "react-native";
import { DialogBlurBackdrop } from "./dialog-blur-backdrop";

type WelcomeAboardDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Shown the first time a member lands in a family they joined (Figma 205:5937). */
export function WelcomeAboardDialog({
  open,
  onOpenChange,
}: WelcomeAboardDialogProps) {
  return (
    <Dialog isOpen={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <DialogBlurBackdrop />
        <Dialog.Content
          className="bg-background-day dark:bg-background-night items-center gap-6 rounded-[20px] px-4 py-5"
          style={{ width: 312, alignSelf: "center" }}
        >
          <View className="bg-main size-[68px] items-center justify-center rounded-full">
            <UsersIcon width={28} height={28} color="#FFFFFF" />
          </View>
          <View className="w-full gap-2.5">
            <Dialog.Title className="text-text-day dark:text-text-night text-center text-xl font-semibold">
              Welcome aboard!
            </Dialog.Title>
            <Dialog.Description className="text-hint text-center text-base">
              You&apos;re now part of the family space.
            </Dialog.Description>
          </View>
          <Pressable
            onPress={() => onOpenChange(false)}
            className="bg-transparent-day dark:bg-transparent-night h-[50px] w-full items-center justify-center rounded-xl active:opacity-70"
          >
            <Text className="text-text-day dark:text-text-night text-base font-medium">
              Continue
            </Text>
          </Pressable>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

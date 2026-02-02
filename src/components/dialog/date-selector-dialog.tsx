import { CustomButton } from "@/components/custom-button";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Dialog } from "heroui-native";
import { useState } from "react";
import { Platform, View } from "react-native";
import { DialogBlurBackdrop } from "./dialog-blur-backdrop";

type DateSelectorDialogProps = {
  date: Date;
  setDate: (date: Date) => void;
  children: React.ReactNode;
};

export function DateSelectorDialog({
  date,
  setDate,
  children,
}: DateSelectorDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingDate, setPendingDate] = useState(() => date || new Date());

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    setPendingDate(date || new Date());
  };

  const handleSelectDate = () => {
    setDate(pendingDate);
    setIsOpen(false);
  };

  return (
    <Dialog isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <DialogBlurBackdrop />
        <Dialog.Content className="bg-background-day dark:bg-background-night">
          <View className="mb-4">
            <DateTimePicker
              mode="date"
              value={pendingDate}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_event, selectedDate) => {
                if (selectedDate) setPendingDate(selectedDate);
              }}
            />
          </View>

          <CustomButton
            className="mt-2 rounded-2xl px-6"
            onPress={handleSelectDate}
          >
            Select Date
          </CustomButton>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

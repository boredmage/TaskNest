import { CustomButton } from "@/components/custom-button";
import { supabase } from "@/lib/supabase";
import { Checkbox, cn, Dialog, Spinner, TextField } from "heroui-native";
import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { DialogBlurBackdrop } from "./dialog-blur-backdrop";

type JoinFamilyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function JoinFamilyDialog({
  open,
  onOpenChange,
}: JoinFamilyDialogProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCodeValid, setIsCodeValid] = useState(false);

  const handleSubmit = async () => {
    console.log("[JOIN FAMILY] Submitting code:", code);
    try {
      setLoading(true);

      const { data, error } = await supabase.rpc("request_to_join_family", {
        p_invite_code: code,
      });

      if (error) {
        throw error;
      }

      setIsCodeValid(true);
    } catch (error) {
      console.error("[JOIN FAMILY] Error:", (error as Error).message);
      Alert.alert("Error", (error as Error).message);
    } finally {
      setLoading(false);
    }
  };
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

          <TextField
            isRequired
            isDisabled={loading || isCodeValid}
            className="my-4"
          >
            <View className="w-full flex-row items-center">
              <TextField.Input
                value={code}
                onChangeText={setCode}
                placeholder="Enter Code"
                className="bg-background-day dark:bg-background-night border-main placeholder:text-main-light active:border-main focus:border-main h-12 flex-1 rounded-xl border-2 text-base leading-tight uppercase shadow-none"
                maxLength={10}
              />
              <View className="absolute right-4 items-center justify-center">
                {loading && (
                  <Spinner
                    color="#72D000"
                    size="md"
                    className="absolute right-0 z-50"
                  />
                )}
                <Checkbox
                  isSelected={isCodeValid}
                  variant="secondary"
                  className={cn(
                    "size-6 rounded-full border-2 shadow-none",
                    isCodeValid
                      ? "bg-main border-main"
                      : "bg-primary-day dark:bg-primary-night border-transparent-day dark:border-transparent-night"
                  )}
                >
                  <Checkbox.Indicator className="bg-transparent" />
                </Checkbox>
              </View>
            </View>
          </TextField>
          <Text
            className={cn(
              "-mt-2 mb-4 text-xs",
              isCodeValid ? "text-main" : "text-hint"
            )}
          >
            {isCodeValid
              ? "Your request has been submitted. Please wait for the family admin to approve your request."
              : "Haven't received the code? Check your spam folder or ask a family member to resend it."}
          </Text>

          <CustomButton
            className="px-6"
            onPress={handleSubmit}
            isDisabled={loading || isCodeValid}
          >
            Submit
          </CustomButton>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

import { CustomButton } from "@/components/custom-button";
import { FieldInput } from "@/components/form/labeled-field";
import XIcon from "@/components/icons/x-icon";
import { api, errorMessage } from "@/lib/api";
import { cn, Dialog, Spinner } from "heroui-native";
import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { DialogBlurBackdrop } from "./dialog-blur-backdrop";

type JoinFamilyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** "🔑 Join a Family" (Figma 205:5999 empty, 205:5976 filled). */
export function JoinFamilyDialog({
  open,
  onOpenChange,
}: JoinFamilyDialogProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const canSubmit = code.trim().length > 0 && !loading && !submitted;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await api.post("/families/join-requests", {
        invite_code: code.trim().toUpperCase(),
      });
      setSubmitted(true);
    } catch (error) {
      Alert.alert("Could not join", errorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog isOpen={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <DialogBlurBackdrop />
        <Dialog.Content className="bg-primary-day dark:bg-primary-night gap-6 rounded-[20px] px-4 py-5">
          <Dialog.Close className="bg-transparent-day dark:bg-transparent-night size-7 items-center justify-center self-end rounded-full p-1">
            <XIcon width={16} height={16} />
          </Dialog.Close>

          <View className="gap-2.5">
            <Dialog.Title className="text-text-day dark:text-text-night text-xl font-semibold">
              🔑 Join a Family
            </Dialog.Title>
            <Dialog.Description className="text-hint text-base">
              To join your family, please enter the code that was shared with
              you.
            </Dialog.Description>
          </View>

          <View className="gap-2.5">
            <View className="justify-center">
              <FieldInput
                value={code}
                onChangeText={setCode}
                placeholder="Enter code"
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!loading && !submitted}
                maxLength={10}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                className={cn("uppercase", loading && "pr-12")}
              />
              {loading ? (
                <View className="absolute right-4">
                  <Spinner color="#72D000" size="sm" />
                </View>
              ) : null}
            </View>
            <Text
              className={cn("text-sm", submitted ? "text-main" : "text-hint")}
            >
              {submitted
                ? "Request sent. You'll be in as soon as the family owner approves it."
                : "Haven't received the code? Ask a family member to share it from their Family settings."}
            </Text>
          </View>

          <CustomButton
            className="h-[50px]"
            onPress={handleSubmit}
            isDisabled={!canSubmit}
          >
            {submitted ? "Request Sent" : "Submit"}
          </CustomButton>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

import { CustomButton } from "@/components/custom-button";
import { supabase } from "@/lib/supabase";
import { useFamilyStore } from "@/stores/family-store";
import { Dialog, Spinner, TextField } from "heroui-native";
import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { DialogBlurBackdrop } from "./dialog-blur-backdrop";

type InviteFamilyMemberDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function InviteFamilyMemberDialog({
  open,
  onOpenChange,
}: InviteFamilyMemberDialogProps) {
  const { inviteCode } = useFamilyStore();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      Alert.alert(
        "Email required",
        "Enter the email of the person you want to invite."
      );
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.rpc("invite_family_member", {
        p_email: trimmed,
      });
      if (error) {
        console.error("[INVITE] invite_family_member error:", error);
        Alert.alert("Could not send invite", error.message);
        return;
      }
      Alert.alert("Invite sent", `An invitation has been sent to ${trimmed}.`);
      setEmail("");
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEmail("");
    onOpenChange(false);
  };

  return (
    <Dialog isOpen={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <DialogBlurBackdrop />
        <Dialog.Content className="bg-background-day dark:bg-background-night gap-6 p-6">
          <Dialog.Close className="bg-transparent-day dark:bg-transparent-night -mb-2 self-end rounded-full p-1.5" />

          <View className="gap-1.5">
            <Dialog.Title className="text-text-day dark:text-text-night text-xl font-bold">
              Invite a family member
            </Dialog.Title>
            <Dialog.Description className="text-hint text-sm">
              Invite an existing TaskNest member by their email address.
            </Dialog.Description>
          </View>

          <View className="gap-2">
            <TextField className="w-full" isRequired isDisabled={loading}>
              <TextField.Input
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className="bg-transparent-day dark:bg-transparent-night border-main placeholder:text-main/70 h-12 rounded-xl border-2 text-base leading-tight"
              />
            </TextField>
          </View>

          {inviteCode ? (
            <View className="gap-1.5">
              <Text className="text-hint text-sm">
                Or share your family code:
              </Text>
              <Text className="text-text-day dark:text-text-night bg-transparent-day dark:bg-transparent-night rounded-xl p-2 text-center text-3xl font-semibold tracking-widest uppercase">
                {inviteCode}
              </Text>
            </View>
          ) : null}

          <View className="flex-row gap-3">
            <CustomButton
              className="flex-1"
              intent="secondary"
              onPress={handleCancel}
              isDisabled={loading}
            >
              Cancel
            </CustomButton>
            <CustomButton
              className="flex-1"
              onPress={handleSubmit}
              isDisabled={loading || !email.trim()}
            >
              {loading ? <Spinner color="#FFFFFF" size="md" /> : "Send invite"}
            </CustomButton>
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

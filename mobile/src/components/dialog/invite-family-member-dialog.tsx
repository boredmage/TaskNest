import { chevronDown, externalLink } from "@/assets/icons";
import { CustomButton } from "@/components/custom-button";
import { FieldInput, LabeledField } from "@/components/form/labeled-field";
import CheckIcon from "@/components/icons/check";
import XIcon from "@/components/icons/x-icon";
import { SvgIcon } from "@/components/svg-icon";
import { useAppTheme } from "@/contexts/app-theme-context";
import { api, errorMessage } from "@/lib/api";
import { useFamilyStore } from "@/stores/family-store";
import { cn, Dialog, Spinner } from "heroui-native";
import { useState } from "react";
import { Alert, Linking, Pressable, Share, Text, View } from "react-native";
import { DialogBlurBackdrop } from "./dialog-blur-backdrop";

type InviteRole = "admin" | "member";

const ROLES: { value: InviteRole | "owner"; label: string }[] = [
  { value: "owner", label: "owner" },
  { value: "member", label: "can view" },
  { value: "admin", label: "can edit" },
];

const ROLES_HELP_URL = "https://tasknest.app/help/roles";

type InviteFamilyMemberDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** "Invite a family member" (Figma 205:6336) with the role menu (205:6358). */
export function InviteFamilyMemberDialog({
  open,
  onOpenChange,
}: InviteFamilyMemberDialogProps) {
  const { isDark } = useAppTheme();
  const inviteCode = useFamilyStore((s) => s.inviteCode);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteRole>("member");
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const canSubmit = email.trim().length > 0 && !loading;

  const reset = () => {
    setEmail("");
    setRole("member");
    setMenuOpen(false);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await api.post("/families/invites", { email: email.trim(), role });
      Alert.alert(
        "Invite sent",
        `An invitation has been sent to ${email.trim()}.`
      );
      reset();
      onOpenChange(false);
    } catch (error) {
      Alert.alert("Could not send invite", errorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const shareCode = () =>
    Share.share({
      title: "Share Family Code",
      message: `Join my family on TaskNest! Use this code: ${inviteCode}`,
    }).catch(() => {});

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      isOpen={open}
      onOpenChange={(value) => {
        if (!value) reset();
        onOpenChange(value);
      }}
    >
      <Dialog.Portal>
        <DialogBlurBackdrop />
        <Dialog.Content className="bg-primary-day dark:bg-primary-night gap-6 rounded-[20px] px-4 py-5">
          <Dialog.Close className="bg-transparent-day dark:bg-transparent-night size-7 items-center justify-center self-end rounded-full p-1">
            <XIcon width={16} height={16} />
          </Dialog.Close>

          <View className="gap-2.5">
            <Dialog.Title className="text-text-day dark:text-text-night text-xl font-semibold">
              Invite a family member
            </Dialog.Title>
            <Dialog.Description className="text-hint text-base">
              Send an invite to a family member.{"\n"}The role can be changed
              later.
            </Dialog.Description>
          </View>

          {inviteCode ? (
            <View className="bg-transparent-day dark:bg-transparent-night flex-row items-center justify-between gap-3 rounded-xl px-4 py-3">
              <View className="gap-0.5">
                <Text className="text-hint text-xs">Family code</Text>
                <Text className="text-text-day dark:text-text-night text-lg font-semibold tracking-[3px]">
                  {inviteCode}
                </Text>
              </View>
              <Pressable
                onPress={shareCode}
                hitSlop={8}
                className="bg-main-light rounded-lg px-3 py-2 active:opacity-70"
              >
                <Text className="text-main text-sm font-medium">Share</Text>
              </Pressable>
            </View>
          ) : null}

          <View className="z-10 gap-3">
            <LabeledField label="Email">
              <FieldInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                returnKeyType="done"
              />
            </LabeledField>

            <LabeledField label="Role">
              <View>
                <Pressable
                  onPress={() => setMenuOpen((v) => !v)}
                  className="bg-transparent-day dark:bg-transparent-night h-[50px] flex-row items-center justify-between gap-3 rounded-xl px-4 active:opacity-80"
                >
                  <Text className="text-text-day dark:text-text-night flex-1 text-base">
                    {ROLES.find((r) => r.value === role)?.label}
                  </Text>
                  <SvgIcon
                    art={chevronDown}
                    size={20}
                    color={isDark ? "#FFFFFF" : "#1B1B1B"}
                  />
                </Pressable>

                {menuOpen ? (
                  <View
                    className="bg-background-day dark:bg-background-night absolute top-[54px] right-0 left-0 overflow-hidden rounded-xl"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.1,
                      shadowRadius: 6,
                      elevation: 6,
                    }}
                  >
                    {ROLES.map((option, index) => {
                      const disabled = option.value === "owner";
                      const selected = option.value === role;
                      return (
                        <Pressable
                          key={option.value}
                          disabled={disabled}
                          onPress={() => {
                            setRole(option.value as InviteRole);
                            setMenuOpen(false);
                          }}
                          className={cn(
                            "h-11 flex-row items-center justify-between px-4 active:opacity-70",
                            index < ROLES.length - 1 &&
                              "border-b border-[#808080]/40"
                          )}
                        >
                          <Text
                            className={cn(
                              "text-base",
                              selected
                                ? "text-main font-medium"
                                : "text-text-day dark:text-text-night",
                              disabled && "opacity-30"
                            )}
                          >
                            {option.label}
                          </Text>
                          {selected ? (
                            <CheckIcon width={18} height={18} />
                          ) : null}
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}
              </View>
            </LabeledField>
          </View>

          <Pressable
            className="flex-row items-center gap-1 active:opacity-70"
            onPress={() => Linking.openURL(ROLES_HELP_URL).catch(() => {})}
          >
            <Text className="text-hint text-sm">
              Learn more about{" "}
              <Text className="text-main font-medium">Team Member Roles</Text>
            </Text>
            <SvgIcon art={externalLink} size={20} />
          </Pressable>

          <View className="flex-row gap-2.5">
            <CustomButton
              className="h-[50px] flex-1"
              intent="secondary"
              onPress={handleCancel}
              isDisabled={loading}
            >
              Cancel
            </CustomButton>
            <CustomButton
              className="h-[50px] flex-1"
              onPress={handleSubmit}
              isDisabled={!canSubmit}
            >
              {loading ? <Spinner color="#FFFFFF" size="md" /> : "Submit"}
            </CustomButton>
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

import { CachedAvatarImage } from "@/components/cached-avatar-image";
import { CustomButton } from "@/components/custom-button";
import Check from "@/components/icons/check";
import User from "@/components/icons/user";
import { getAvatarUrl } from "@/lib/util";
import type { FamilyMember } from "@/stores/family-store";
import { Avatar, Checkbox, cn, Dialog } from "heroui-native";
import { Pressable, Text, View } from "react-native";
import { DialogBlurBackdrop } from "./dialog-blur-backdrop";

type MemberPickerDialogProps = {
  members: FamilyMember[];
  selected: string[];
  onChange: (userIds: string[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Multi-select list of family members for the "Assign To" field. */
export function MemberPickerDialog({
  members,
  selected,
  onChange,
  open,
  onOpenChange,
}: MemberPickerDialogProps) {
  const toggle = (userId: string) =>
    onChange(
      selected.includes(userId)
        ? selected.filter((id) => id !== userId)
        : [...selected, userId]
    );

  return (
    <Dialog isOpen={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <DialogBlurBackdrop />
        <Dialog.Content className="bg-primary-day dark:bg-primary-night gap-4 rounded-[20px] px-4 py-5">
          <Dialog.Title className="text-text-day dark:text-text-night text-xl font-semibold">
            Assign To
          </Dialog.Title>
          <View>
            {members.map((member, index) => {
              const isSelected = selected.includes(member.user_id);
              return (
                <Pressable
                  key={member.user_id}
                  onPress={() => toggle(member.user_id)}
                  className={cn(
                    "h-[60px] flex-row items-center gap-3 active:opacity-70",
                    index < members.length - 1 && "border-b border-[#808080]/30"
                  )}
                >
                  <Avatar
                    alt={member.name}
                    className="bg-transparent-day dark:bg-transparent-night size-10"
                  >
                    {member.avatar_url ? (
                      <CachedAvatarImage
                        uri={getAvatarUrl(member.avatar_url) ?? undefined}
                      />
                    ) : null}
                    <Avatar.Fallback color="accent">
                      <User width={18} height={18} color="#A0A0A0" />
                    </Avatar.Fallback>
                  </Avatar>
                  <Text className="text-text-day dark:text-text-night flex-1 text-base">
                    {member.name}
                  </Text>
                  <Checkbox
                    isSelected={isSelected}
                    variant="secondary"
                    onSelectedChange={() => toggle(member.user_id)}
                    className={cn(
                      "size-6 rounded-full border-2 shadow-none",
                      isSelected
                        ? "bg-main border-main"
                        : "bg-primary-day dark:bg-primary-night border-transparent-day dark:border-transparent-night"
                    )}
                  >
                    <Checkbox.Indicator className="bg-transparent">
                      <Check fill="#ffffff" width={14} height={14} />
                    </Checkbox.Indicator>
                  </Checkbox>
                </Pressable>
              );
            })}
          </View>
          <CustomButton
            className="h-[50px]"
            onPress={() => onOpenChange(false)}
          >
            Done
          </CustomButton>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

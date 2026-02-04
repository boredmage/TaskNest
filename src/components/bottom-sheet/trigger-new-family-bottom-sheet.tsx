import { BottomSheetBlurOverlay } from "@/components/bottom-sheet/bottom-sheet-blur-overlay";
import { CustomButton } from "@/components/custom-button";
import { JoinFamilyDialog } from "@/components/dialog/join-family-dialog";
import File from "@/components/icons/bottom-sheet/file";
import Heart from "@/components/icons/bottom-sheet/heart";
import Link from "@/components/icons/bottom-sheet/link";
import Message from "@/components/icons/bottom-sheet/message";
import Pin from "@/components/icons/bottom-sheet/pin";
import Users from "@/components/icons/bottom-sheet/users";
import { useAppTheme } from "@/contexts/app-theme-context";
import { supabase } from "@/lib/supabase";
import { Avatar, BottomSheet, cn, RadioGroup } from "heroui-native";
import { useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type FamilyOption = "create" | "join" | null;

const iconsMap = [
  { id: 1, icon: <File color="white" />, bg: "#10D470" },
  { id: 2, icon: <Pin color="white" />, bg: "#FFA446" },
  { id: 3, icon: <Heart color="white" />, bg: "#3A8AFF" },
  { id: 4, icon: <Link color="white" />, bg: "#767676" },
  { id: 5, icon: <Message color="white" />, bg: "#7559EA" },
];

export function TriggerNewFamilyBottomSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<FamilyOption>(null);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();

  const familyOptions: Array<{
    value: "create" | "join";
    label: string;
    description: string;
    icon: React.ReactNode;
  }> = [
    {
      value: "create",
      label: "Create a Family",
      description: "Invite others to join and manage tasks together.",
      icon: <Users color={isDark ? "#FFFFFF" : "#1B1B1B"} />,
    },
    {
      value: "join",
      label: "Join with a Code",
      description: "Enter your family code to join an existing group.",
      icon: (
        <Link color={isDark ? "#FFFFFF" : "#1B1B1B"} width={32} height={32} />
      ),
    },
  ];
  const handleNext = async () => {
    if (selectedOption == null) return;
    if (selectedOption === "join") {
      setJoinDialogOpen(true);
    } else {
      const { data, error } = await supabase.rpc("create_family");

      if (error) {
        console.error(error);
      } else {
        // {
        //   "id": "24d2bdd0-5f74-482e-a629-d235c33b1c1a",
        //   "owner_id": "26c72634-0fdb-4660-b4c9-c1e6822f98d5",
        //   "invite_code": "FCC25ADC18",
        //   "is_archived": false,
        //   "archived_at": null,
        //   "created_at": "2026-02-04T02:43:55.51066+00:00"
        // }
        console.log(
          "[CREATE FAMILY] Successfully created family",
          JSON.stringify(data, null, 2)
        );
      }
    }
    // create: leave for now
    setIsOpen(false);
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onOpenChange={(value) => {
        setIsOpen(value);
        if (!value) setSelectedOption(null);
      }}
    >
      <BottomSheet.Trigger asChild>
        <CustomButton size="sm" className="px-6">
          Start
        </CustomButton>
      </BottomSheet.Trigger>
      <BottomSheet.Portal>
        <BottomSheetBlurOverlay />
        <BottomSheet.Content
          detached={true}
          enableOverDrag={false}
          bottomInset={insets.bottom - 10}
          className="mx-3"
          backgroundClassName="rounded-[32px] bg-background-day dark:bg-background-night"
          contentContainerClassName="pb-4"
        >
          <View className="mb-5 items-center">
            <View className="flex-row gap-4">
              {iconsMap.map((user, index) => (
                <Avatar
                  key={user.id}
                  className={cn(
                    "border-background-day dark:border-background-night border-3",
                    index !== 0 && "-ml-7"
                  )}
                  alt={user.id.toString()}
                  style={{ zIndex: iconsMap.length - index }}
                >
                  <Avatar.Image source={{ uri: user.bg }} />
                  <Avatar.Fallback
                    className="size-20"
                    style={{ backgroundColor: user.bg }}
                  >
                    {user.icon}
                  </Avatar.Fallback>
                </Avatar>
              ))}
            </View>
          </View>
          <View className="mb-6 items-center">
            <BottomSheet.Title className="text-text-day dark:text-text-night text-center text-2xl font-bold">
              🔍 No family group found.
            </BottomSheet.Title>
            <BottomSheet.Description className="text-hint text-center text-lg">
              Create a new one or join with a code.
            </BottomSheet.Description>
          </View>

          <RadioGroup
            value={selectedOption ?? undefined}
            onValueChange={(v) =>
              setSelectedOption((v ?? null) as FamilyOption)
            }
            className="mb-6 gap-3"
          >
            {familyOptions.map((opt) => (
              <RadioGroup.Item key={opt.value} value={opt.value}>
                {({ isSelected }) => (
                  <View
                    className={cn(
                      "bg-transparent-day flex-row items-center gap-3 rounded-2xl border-2 px-4 py-3",
                      isSelected ? "border-main" : "border-transparent"
                    )}
                  >
                    <View className="size-10 items-center justify-center">
                      {opt.icon}
                    </View>
                    <View className="flex-1">
                      <RadioGroup.Label className="text-text-day dark:text-text-night text-base font-semibold">
                        {opt.label}
                      </RadioGroup.Label>
                      <RadioGroup.Description className="text-hint text-sm">
                        {opt.description}
                      </RadioGroup.Description>
                    </View>
                  </View>
                )}
              </RadioGroup.Item>
            ))}
          </RadioGroup>

          <CustomButton
            className="rounded-2xl px-6"
            isDisabled={selectedOption == null}
            onPress={handleNext}
          >
            Next
          </CustomButton>
        </BottomSheet.Content>
      </BottomSheet.Portal>
      <JoinFamilyDialog
        open={joinDialogOpen}
        onOpenChange={setJoinDialogOpen}
      />
    </BottomSheet>
  );
}

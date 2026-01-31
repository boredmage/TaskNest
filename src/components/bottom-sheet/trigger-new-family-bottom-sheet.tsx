import { View } from "react-native";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar, BottomSheet, cn, RadioGroup } from "heroui-native";
import { CustomButton } from "@/components/custom-button";
import { BottomSheetBlurOverlay } from "@/components/bottom-sheet/bottom-sheet-blur-overlay";
import { JoinFamilyDialog } from "@/components/dialog/join-family-dialog";
import File from "@/components/icons/bottom-sheet/file";
import Pin from "@/components/icons/bottom-sheet/pin";
import Heart from "@/components/icons/bottom-sheet/heart";
import Link from "@/components/icons/bottom-sheet/link";
import Message from "@/components/icons/bottom-sheet/message";
import Users from "@/components/icons/bottom-sheet/users";
import { useColorScheme } from "react-native";

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
  const isDarkTheme = useColorScheme() === "dark";

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
        icon: <Users color={isDarkTheme ? "#FFFFFF" : "#1B1B1B"} />,
      },
      {
        value: "join",
        label: "Join with a Code",
        description: "Enter your family code to join an existing group.",
        icon: <Link color={isDarkTheme ? "#FFFFFF" : "#1B1B1B"} width={32} height={32} />,
      },
    ];
  const handleNext = () => {
    if (selectedOption == null) return;
    setIsOpen(false);
    if (selectedOption === "join") {
      setJoinDialogOpen(true);
    }
    // create: leave for now
  };

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen}>
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
          <View className="items-center mb-5">
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
            <BottomSheet.Title className="text-center text-2xl font-bold text-text-day dark:text-text-night">
              🔍 No family group found.
            </BottomSheet.Title>
            <BottomSheet.Description className="text-center text-lg text-hint">
              Create a new one or join with a code.
            </BottomSheet.Description>
          </View>

          <RadioGroup
            value={selectedOption ?? undefined}
            onValueChange={(v) => setSelectedOption((v ?? null) as FamilyOption)}
            className="gap-3 mb-6"
          >
            {familyOptions.map((opt) => (
              <RadioGroup.Item key={opt.value} value={opt.value}>
                {({ isSelected }) => (
                  <View
                    className={cn(
                      "flex-row items-center gap-3 rounded-2xl px-4 py-3 bg-transparent-day border-2",
                      isSelected ? "border-main" : "border-transparent"
                    )}
                  >
                    <View className="size-10 items-center justify-center">
                      {opt.icon}
                    </View>
                    <View className="flex-1">
                      <RadioGroup.Label className="text-base font-semibold text-text-day dark:text-text-night">
                        {opt.label}
                      </RadioGroup.Label>
                      <RadioGroup.Description className="text-sm text-hint">
                        {opt.description}
                      </RadioGroup.Description>
                    </View>
                  </View>
                )}
              </RadioGroup.Item>
            ))}
          </RadioGroup>

          <CustomButton
            className="px-6 rounded-2xl"
            isDisabled={selectedOption == null}
            onPress={handleNext}
          >
            Next
          </CustomButton>
        </BottomSheet.Content>
      </BottomSheet.Portal>
      <JoinFamilyDialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen} />
    </BottomSheet>
  );
}

import { CustomButton } from "@/components/custom-button";
import CameraPlus from "@/components/icons/camera-plus";
import ChevronRight from "@/components/icons/chevron-right";
import PlusIcon from "@/components/icons/plus";
import { Spinner, TextField } from "heroui-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

const ProfileUpdate = () => {
  const [name, setName] = useState("Alex Johnson");
  const [dateOfBirth, setDateOfBirth] = useState("30.08.2001");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    // console.log("Saving profile...");
    // Promise of 3 seconds
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setLoading(false);
    console.log("Profile saved");
  };

  return (
    <>
      {/* Profile Picture Section */}
      <View className="mb-8 items-center">
        <View className="relative">
          <View className="bg-transparent-day dark:bg-transparent-night h-24 w-24 items-center justify-center rounded-full">
            <View className="size-12 items-center justify-center">
              <CameraPlus />
            </View>
          </View>
          <Pressable className="bg-main dark:border-background-night absolute right-0 bottom-0 size-7 items-center justify-center rounded-xl border-2 border-white">
            <PlusIcon width={16} height={16} />
          </Pressable>
        </View>
      </View>

      {/* Input Fields */}
      <View className="mb-6 gap-4">
        <TextField>
          <TextField.Input
            value={name}
            onChangeText={setName}
            className="h-12 rounded-xl border-0 bg-[#E5E5E5] px-4 text-base leading-tight shadow-none"
            placeholder="Name"
          />
        </TextField>

        <Pressable>
          <TextField>
            <View className="w-full flex-row items-center justify-between">
              <TextField.Input
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                className="h-12 flex-1 rounded-xl border-0 bg-[#E5E5E5] px-4 text-base leading-tight shadow-none"
                placeholder="Date of Birth"
                editable={false}
              />
              <View className="absolute right-4">
                <ChevronRight />
              </View>
            </View>
          </TextField>
        </Pressable>
      </View>

      {/* Save Button */}
      <View className="mt-auto pb-6">
        <CustomButton
          className="h-12 w-full rounded-xl"
          onPress={handleSave}
          isDisabled={loading}
        >
          {loading ? <Spinner color="#72D000" /> : "Save"}
        </CustomButton>
      </View>
    </>
  );
};

export default ProfileUpdate;

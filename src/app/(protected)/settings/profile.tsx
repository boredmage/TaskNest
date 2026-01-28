import { View, Text, Pressable, Image } from "react-native";
import { useState } from "react";
import { TextField } from "heroui-native";
import WithArrowBack from "@/layout/with-arrow-back";
import { CustomButton } from "@/components/custom-button";
import PlusIcon from "@/components/icons/plus";
import ChevronRight from "@/components/icons/chevron-right";
import CameraPlus from "@/components/icons/camera-plus";

const Profile = () => {
  const [name, setName] = useState("Alex Johnson");
  const [dateOfBirth, setDateOfBirth] = useState("30.08.2001");

  return (
    <WithArrowBack title="Profile">
      <View className="flex-1 mt-10">
        {/* Profile Picture Section */}
        <View className="items-center mb-8">
          <View className="relative">
            <View className="w-24 h-24 rounded-full bg-[#E5E5E5] items-center justify-center">
              <View className="size-12 items-center justify-center">
                <CameraPlus />
              </View>
            </View>
            <Pressable className="absolute bottom-0 right-0 size-7 bg-primary rounded-xl items-center justify-center border-2 border-white">
              <PlusIcon width={16} height={16} />
            </Pressable>
          </View>
        </View>

        {/* Input Fields */}
        <View className="gap-4 mb-6">
          <TextField>
            <TextField.Input
              value={name}
              onChangeText={setName}
              className="rounded-xl bg-[#E5E5E5] border-0 shadow-none h-12 text-base leading-tight px-4"
              placeholder="Name"
            />
          </TextField>

          <Pressable>
            <TextField>
              <View className="flex-row items-center justify-between w-full">
                <TextField.Input
                  value={dateOfBirth}
                  onChangeText={setDateOfBirth}
                  className="flex-1 rounded-xl bg-[#E5E5E5] border-0 shadow-none h-12 text-base leading-tight px-4"
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
          <CustomButton className="w-full h-12 rounded-xl" onPress={() => { }}>
            Save
          </CustomButton>
        </View>
      </View>
    </WithArrowBack>
  );
};

export default Profile;

import ProfileUpdate from "@/components/form/profile-update";
import WithArrowBack from "@/layout/with-arrow-back";
import { Text, View } from "react-native";

const UpdateProfile = () => {
  return (
    <WithArrowBack>
      <View className="flex-1 pt-28">
        <View className="flex-1">
          <View className="mb-6">
            <Text className="text-text-day dark:text-text-night text-2xl font-semibold">
              Complete your profile
            </Text>
            <Text className="text-hint text-base">
              Add your name, photo, and date of birth to get started.
            </Text>
          </View>

          <ProfileUpdate />
        </View>
      </View>
    </WithArrowBack>
  );
};

export default UpdateProfile;

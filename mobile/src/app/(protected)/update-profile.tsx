import ProfileUpdate from "@/components/form/profile-update";
import WithArrowBack from "@/layout/with-arrow-back";
import { useProfileStore } from "@/stores/profile-store";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

/**
 * "Complete your profile" gate shown once after sign-up. The tabs are guarded
 * off while the gate is up, so this screen is the only route; both skipping
 * and saving must explicitly navigate home once the guard lifts.
 */
const UpdateProfile = () => {
  const router = useRouter();
  const dismissProfileGate = useProfileStore((s) => s.dismissProfileGate);
  const goHome = () => router.replace("/(tabs)");
  const skip = async () => {
    await dismissProfileGate();
    goHome();
  };
  return (
    <WithArrowBack onBack={skip}>
      <View className="flex-1 pt-28">
        <View className="flex-1">
          <View className="mb-6">
            <Text className="text-text-day dark:text-text-night text-xl font-semibold">
              Complete your profile
            </Text>
            <Text className="text-hint text-base">
              Add your name, photo, and date of birth to get started.
            </Text>
          </View>

          <ProfileUpdate onSaved={goHome} />
        </View>
      </View>
    </WithArrowBack>
  );
};

export default UpdateProfile;

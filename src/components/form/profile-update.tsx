import { CustomButton } from "@/components/custom-button";
import { DateSelectorDialog } from "@/components/dialog/date-selector-dialog";
import CameraPlus from "@/components/icons/camera-plus";
import ChevronRight from "@/components/icons/chevron-right";
import PlusIcon from "@/components/icons/plus";
import { getAvatarUrl } from "@/lib/util";
import { useProfileStore } from "@/stores/profile-store";
import { format } from "date-fns";
import * as ImagePicker from "expo-image-picker";
import { Avatar, Spinner, TextField } from "heroui-native";
import { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

const ProfileUpdate = () => {
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | undefined>(undefined);
  const [selectedAsset, setSelectedAsset] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const {
    profile,
    updateProfile: updateProfileStore,
    uploadAvatar: uploadAvatarStore,
  } = useProfileStore();

  useEffect(() => {
    if (!profile) return;
    setName(profile.full_name ?? "");
    setDateOfBirth(
      profile.date_of_birth ? new Date(profile.date_of_birth) : undefined
    );
    const url = getAvatarUrl(profile.avatar_url);
    setAvatarUri(url ?? undefined);
  }, [profile]);

  const handleSave = async () => {
    setLoading(true);

    try {
      let finalAvatarPath: string | null = null;

      // If avatarUri is a local URI (starts with file:// or content://), upload it
      if (
        avatarUri &&
        (avatarUri.startsWith("file://") ||
          avatarUri.startsWith("content://")) &&
        selectedAsset
      ) {
        const { path, error: uploadError } =
          await uploadAvatarStore(selectedAsset);
        if (uploadError || !path) {
          Alert.alert("Error", "Failed to upload avatar. Please try again.");
          setLoading(false);
          return;
        }
        finalAvatarPath = path;
        setSelectedAsset(null); // Clear selected asset after upload
      } else if (avatarUri) {
        // If it's already a URL or data URL, check if it's a storage path
        // If it's a storage path (doesn't start with http://, https://, data:, file://, content://), use it as is
        if (
          !avatarUri.startsWith("http://") &&
          !avatarUri.startsWith("https://") &&
          !avatarUri.startsWith("data:") &&
          !avatarUri.startsWith("file://") &&
          !avatarUri.startsWith("content://")
        ) {
          // It's already a storage path
          finalAvatarPath = avatarUri;
        } else {
          // It's a URL, we can't store it as a path - keep the current avatar_url
          finalAvatarPath = profile?.avatar_url || null;
        }
      }

      // Update profile with the path
      const { error } = await updateProfileStore({
        full_name: name.trim(),
        date_of_birth: dateOfBirth?.toISOString() ?? undefined,
        avatar_url: finalAvatarPath,
      });

      if (error) {
        Alert.alert("Error", "Failed to update profile. Please try again.");
        setLoading(false);
        return;
      }

      // Convert the saved path to a displayable URL
      // const displayUrl = getAvatarUrl(finalAvatarPath);
      // setAvatarUri(displayUrl);
      // setOriginalAvatarUri(displayUrl);
      // setOriginalName(name.trim());

      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    // Request permission to access media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera roll permissions to change your avatar!"
      );
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true, // Request base64 to enable direct upload
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
      setSelectedAsset(result.assets[0]); // Store the asset for upload
    }
  };

  return (
    <>
      {/* Profile Picture Section */}
      <View className="mb-8 items-center">
        <Pressable onPress={pickImage} className="relative">
          <Avatar
            alt="User"
            className="bg-transparent-day dark:bg-transparent-night size-24"
          >
            <Avatar.Image source={{ uri: avatarUri }} />
            <Avatar.Fallback>
              <CameraPlus />
            </Avatar.Fallback>
          </Avatar>
          <View className="bg-main dark:border-background-night absolute right-0 bottom-0 size-7 items-center justify-center rounded-xl border-2 border-white">
            <PlusIcon width={16} height={16} />
          </View>
        </Pressable>
      </View>

      {/* Input Fields */}
      <View className="mb-6 gap-4">
        <TextField isDisabled={loading}>
          <TextField.Input
            value={name}
            onChangeText={setName}
            className="bg-transparent-day dark:bg-transparent-night h-12 rounded-xl border-0 px-4 text-base leading-tight shadow-none"
            placeholder="Your Name"
          />
        </TextField>
      </View>

      <DateSelectorDialog
        date={dateOfBirth || new Date()}
        setDate={(date) => setDateOfBirth(date)}
      >
        <Pressable>
          <View className="bg-transparent-day dark:bg-transparent-night h-12 w-full flex-row items-center justify-between rounded-xl px-4">
            <Text className="text-text-day dark:text-text-night flex-1 text-base leading-tight">
              Date of Birth
            </Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-hint text-base leading-tight">
                {dateOfBirth ? format(dateOfBirth, "dd.MM.yyyy") : ""}
              </Text>
              <ChevronRight />
            </View>
          </View>
        </Pressable>
      </DateSelectorDialog>

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

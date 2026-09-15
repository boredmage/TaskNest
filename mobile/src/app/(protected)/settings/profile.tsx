import ProfileUpdate from "@/components/form/profile-update";
import WithArrowBack from "@/layout/with-arrow-back";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

const Profile = () => {
  const { t } = useTranslation();

  return (
    <WithArrowBack title={t("settings.profile")}>
      <View className="mt-10 flex-1">
        <ProfileUpdate />
      </View>
    </WithArrowBack>
  );
};

export default Profile;

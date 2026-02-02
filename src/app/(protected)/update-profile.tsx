import ProfileUpdate from "@/components/form/profile-update";
import WithArrowBack from "@/layout/with-arrow-back";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, View } from "react-native";

const UpdateProfile = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const signInWithEmail = async () => {
    try {
      setLoading(true);
      const { error, data } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;
      console.log("[LOG: SignInWithEmail]: ", data);
      router.replace("/");
    } catch (error) {
      console.log("[LOG: SignInWithEmail]: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

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

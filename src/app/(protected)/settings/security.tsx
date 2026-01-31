import { View, Text } from "react-native";
import { useState } from "react";
import { Switch } from "heroui-native";
import WithArrowBack from "@/layout/with-arrow-back";
import { useTranslation } from "react-i18next";

type SecurityKey =
  | "rememberMe"
  | "biometricId"
  | "faceId"
  | "smsAuthenticator"
  | "googleAuthenticator"
  | "deviceManagement";

type SecurityRowProps = {
  title: string;
  description: string;
  value: boolean;
  onChange: () => void;
};

const SecurityRow = ({ title, description, value, onChange }: SecurityRowProps) => {
  return (
    <View>
      <View className="bg-white rounded-xl px-4 py-3">
        <View className="flex-row items-center">
          <Text className="flex-1 text-base text-black">
            {title}
          </Text>
          <Switch
            className="w-[48px] h-[28px]"
            isSelected={value}
            onSelectedChange={onChange}
            animation={{
              backgroundColor: {
                value: ["#E5E5E5", "#72D000"],
              },
            }}
          >
            <Switch.Thumb
              className="size-5 bg-white rounded-full"
              animation={{
                left: {
                  value: 3,
                  springConfig: {
                    damping: 30,
                    stiffness: 300,
                    mass: 1,
                  },
                },
              }}
            />
          </Switch>
        </View>
      </View>
      <Text className="mt-1 text-xs text-hint-day px-4">{description}</Text>
    </View>
  );
};

const Security = () => {
  const { t } = useTranslation();
  const [security, setSecurity] = useState({
    rememberMe: true,
    biometricId: true,
    faceId: false,
    smsAuthenticator: true,
    googleAuthenticator: false,
    deviceManagement: true,
  });

  const toggle = (key: SecurityKey) => {
    setSecurity((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <WithArrowBack title={t("settings.security")}>
      <View className="flex-1 bg-[#F2F2F2] mt-10">
        <View className="gap-6">
          <SecurityRow
            title="Remember me"
            description="Stay signed in on this device."
            value={security.rememberMe}
            onChange={() => toggle("rememberMe")}
          />
          <SecurityRow
            title="Biometric ID"
            description="Use fingerprint to sign in securely."
            value={security.biometricId}
            onChange={() => toggle("biometricId")}
          />
          <SecurityRow
            title="Face ID"
            description="Use Face ID to sign in quickly and securely."
            value={security.faceId}
            onChange={() => toggle("faceId")}
          />
          <SecurityRow
            title="SMS Authenticator"
            description="Receive a verification code via SMS during login."
            value={security.smsAuthenticator}
            onChange={() => toggle("smsAuthenticator")}
          />
          <SecurityRow
            title="Google Authenticator"
            description="Use Google Authenticator for two-step verification."
            value={security.googleAuthenticator}
            onChange={() => toggle("googleAuthenticator")}
          />
          <SecurityRow
            title="Device Management"
            description="Manage and view all devices linked to your account."
            value={security.deviceManagement}
            onChange={() => toggle("deviceManagement")}
          />
        </View>
      </View>
    </WithArrowBack>
  );
};

export default Security;


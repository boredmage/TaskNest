import { View, Text } from "react-native";
import { useState } from "react";
import WithArrowBack from "@/layout/with-arrow-back";
import { useTranslation } from "react-i18next";
import { CustomSwitch } from "@/components/custom-switch";

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

const SecurityRow = ({
  title,
  description,
  value,
  onChange,
}: SecurityRowProps) => {
  return (
    <View>
      <View className="bg-primary-day dark:bg-primary-night rounded-xl px-4 py-3">
        <View className="flex-row items-center">
          <Text className="flex-1 text-base text-text-day dark:text-text-night">
            {title}
          </Text>
          <CustomSwitch value={value} onValueChange={onChange} size="medium" />
        </View>
      </View>
      <Text className="mt-1 text-xs text-hint px-4">{description}</Text>
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
      <View className="flex-1 mt-10">
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

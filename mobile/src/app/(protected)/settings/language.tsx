import Check from "@/components/icons/check";
import WithArrowBack from "@/layout/with-arrow-back";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { cn } from "heroui-native";
import { useTranslation } from "react-i18next";
import { Image, Pressable, Text, View } from "react-native";

// PNG URLs (React Native Image does not load SVG from URI on iOS/Android)
const FLAG_ICONS = {
  en: "https://flagcdn.com/w160/us.png",
  fr: "https://flagcdn.com/w160/fr.png",
} as const;

type LanguageRowProps = {
  language: string;
  flagUri: string;
  onChange: () => void;
  isSelected: boolean;
};

const LanguageRow = ({
  language,
  flagUri,
  onChange,
  isSelected,
}: LanguageRowProps) => {
  return (
    <Pressable
      className="bg-primary-day dark:bg-primary-night rounded-xl px-4 py-3 active:opacity-70"
      onPress={onChange}
    >
      <View className="flex-row items-center">
        <Image
          source={{ uri: flagUri }}
          className="h-12 w-20 overflow-hidden rounded-md"
          resizeMode="cover"
        />
        <Text
          className={cn(
            "text-text-day dark:text-text-night ml-3 flex-1 text-base",
            isSelected && "font-semibold"
          )}
        >
          {language}
        </Text>
        {isSelected && <Check className="size-4" />}
      </View>
    </Pressable>
  );
};

const Language = () => {
  const { i18n } = useTranslation();
  const { t } = useTranslation();

  const changeLanguage = async (lang: "en" | "fr") => {
    await i18n.changeLanguage(lang);
    AsyncStorage.setItem("language", lang);
  };

  return (
    <WithArrowBack title={t("settings.language")}>
      <View className="mt-10 flex-1">
        <View className="gap-2">
          <LanguageRow
            language="English"
            flagUri={FLAG_ICONS.en}
            onChange={() => changeLanguage("en")}
            isSelected={i18n.language === "en"}
          />
          <LanguageRow
            language="French"
            flagUri={FLAG_ICONS.fr}
            onChange={() => changeLanguage("fr")}
            isSelected={i18n.language === "fr"}
          />
        </View>
      </View>
    </WithArrowBack>
  );
};

export default Language;

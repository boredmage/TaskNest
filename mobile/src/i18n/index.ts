import i18n, { InitOptions, Resource } from "i18next";
import { initReactI18next } from "react-i18next";

import * as Localization from "expo-localization";

import en from "./en.json";
import fr from "./fr.json";

const resources = {
  fr: { translation: fr },
  en: { translation: en },
};

i18n.use(initReactI18next).init<InitOptions<Resource>>({
  resources,
  lng: Localization.getLocales()[0].languageCode as string,
  fallbackLng: "fr",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

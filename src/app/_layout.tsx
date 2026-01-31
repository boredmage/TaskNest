import "../../global.css";
import { HeroUINativeProvider } from 'heroui-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Slot } from "expo-router";
import {
  KeyboardAvoidingView,
  KeyboardProvider,
} from 'react-native-keyboard-controller';
import { useCallback, useEffect } from "react";
import "@/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "@/i18n";

const AppContent = () => {
  const contentWrapper = useCallback(
    (children: React.ReactNode) => (
      <KeyboardAvoidingView
        pointerEvents="box-none"
        behavior="padding"
        keyboardVerticalOffset={12}
        className="flex-1"
      >
        {children}
      </KeyboardAvoidingView>
    ),
    []
  );

  return (
    <HeroUINativeProvider
      config={{
        toast: {
          contentWrapper,
        },
        devInfo: {
          stylingPrinciples: false,
        },
      }}
    >
      <Slot />
    </HeroUINativeProvider>
  );
};

export default function Layout() {
  useEffect(() => {
    (async () => {
      const savedLang = await AsyncStorage.getItem("language");
      if (savedLang) {
        await i18n.changeLanguage(savedLang);
      }
    })();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <AppContent />
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

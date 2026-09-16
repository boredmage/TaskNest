import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage } from "zustand/middleware";

/**
 * Shared bits for the persisted stores (todos, notifications, family,
 * profile). Each keeps its data in AsyncStorage so the app opens with the
 * last-known state before any request is made, which is what makes it
 * usable offline.
 */
export const jsonStorage = () => createJSONStorage(() => AsyncStorage);

type Persisted = {
  persist: {
    hasHydrated: () => boolean;
    onFinishHydration: (fn: () => void) => () => void;
  };
};

/** Resolves once the store has loaded its persisted state. */
export function whenHydrated(store: Persisted): Promise<void> {
  if (store.persist.hasHydrated()) return Promise.resolve();
  return new Promise((resolve) => {
    const unsub = store.persist.onFinishHydration(() => {
      unsub();
      resolve();
    });
  });
}

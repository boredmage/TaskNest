import {
  auth,
  AuthUser,
  getSession,
  getUser,
  onSessionChange,
  restoreSession,
  Session,
} from "@/lib/api";
import { create } from "zustand";

interface AuthStore {
  session: Session | null;
  user: AuthUser | null;
  /** True once the persisted session has been read from SecureStore. */
  initialized: boolean;
  /** True briefly after a successful sign-in while the success dialog shows. */
  celebrating: boolean;

  restore: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  finishCelebration: () => void;
}

export const useAuthStore = create<AuthStore>((set) => {
  // Mirror every session change made by the API client (refresh, 401, sign-out).
  onSessionChange((session, user) => set({ session, user }));

  return {
    session: getSession(),
    user: getUser(),
    initialized: false,
    celebrating: false,

    restore: async () => {
      const { session, user } = await restoreSession();
      set({ session, user, initialized: true });
    },

    signIn: async (email, password) => {
      await auth.signIn(email, password);
      set({ celebrating: true });
    },

    signUp: async (email, password) => {
      await auth.signUp(email, password);
    },

    signOut: async () => {
      await auth.signOut();
    },

    finishCelebration: () => set({ celebrating: false }),
  };
});

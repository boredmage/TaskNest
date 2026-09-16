import { api, errorMessage, getUser, isNetworkError } from "@/lib/api";
import { prefetchAvatar } from "@/lib/avatar-cache";
import { commit, registerHandler } from "@/lib/outbox";
import { jsonStorage } from "@/lib/storage";
import { getAvatarUrl } from "@/lib/util";
import { UPDATE_PROFILE_REDIRECT_KEY } from "@/utils/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/** The "complete your profile" skip is remembered per account, not per device. */
const gateKey = (userId: string) => `${UPDATE_PROFILE_REDIRECT_KEY}:${userId}`;

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at?: string;
  updated_at?: string;
  /** Calendar date (YYYY-MM-DD) or null */
  date_of_birth?: string | null;
}

interface ProfileStore {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  /** True once the first fetch after sign-in has settled (success or failure). */
  initialized: boolean;
  /** The user skipped the "complete your profile" screen once; don't force it again. */
  gateDismissed: boolean;

  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: {
    full_name?: string;
    avatar_url?: string | null;
    date_of_birth?: string | undefined;
  }) => Promise<{ error: any; queued?: boolean }>;
  uploadAvatar: (
    image: ImagePicker.ImagePickerAsset
  ) => Promise<{ path: string | null; error: any }>;
  clearProfile: () => void;
  dismissProfileGate: () => Promise<void>;

  // Computed getters
  getDisplayName: () => string;
  getAvatarUrl: () => string | null;
  getInitials: () => string;
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      profile: null,
      loading: false,
      error: null,
      initialized: false,
      gateDismissed: false,

      fetchProfile: async () => {
        set({ loading: true, error: null });
        try {
          if (!getUser()) {
            set({ loading: false, error: "User not authenticated" });
            return;
          }
          const [data, dismissed] = await Promise.all([
            api.get<Profile>("/profiles/me"),
            AsyncStorage.getItem(gateKey(getUser()!.id)).catch(() => null),
          ]);
          set({
            profile: data,
            gateDismissed: dismissed === "true",
            loading: false,
            error: null,
          });
          void prefetchAvatar(getAvatarUrl(data.avatar_url));
        } catch (err: unknown) {
          // Offline: the persisted profile stands.
          if (!isNetworkError(err))
            console.error("Error in fetchProfile:", err);
          set({
            loading: false,
            error: isNetworkError(err)
              ? null
              : errorMessage(err, "Failed to fetch profile"),
          });
        } finally {
          set({ initialized: true });
        }
      },

      updateProfile: async (updates) => {
        if (!getUser()) {
          return { error: "User not authenticated" };
        }
        // Local first; the server copy replaces it once the change is sent.
        const prev = get().profile;
        if (prev) {
          set({
            profile: {
              ...prev,
              ...(updates.full_name !== undefined && {
                full_name: updates.full_name,
              }),
              ...(updates.avatar_url !== undefined && {
                avatar_url: updates.avatar_url,
              }),
              ...(updates.date_of_birth !== undefined && {
                date_of_birth: updates.date_of_birth,
              }),
            },
          });
        }
        try {
          const { queued } = await commit({ kind: "profile.update", updates });
          return { error: null, queued };
        } catch (err) {
          console.error("Error in updateProfile:", err);
          set({ profile: prev });
          return { error: err };
        }
      },

      uploadAvatar: async (image) => {
        try {
          if (!getUser()) {
            return { path: null, error: "User not authenticated" };
          }

          const fileExt = image.uri.split(".").pop()?.toLowerCase() || "jpg";
          const mimeType =
            image.mimeType ?? (fileExt === "png" ? "image/png" : "image/jpeg");

          const form = new FormData();
          // React Native's FormData accepts { uri, name, type } for files.
          form.append("file", {
            uri: image.uri,
            name: `avatar.${fileExt}`,
            type: mimeType,
          } as unknown as Blob);

          const data = await api.upload<{ path: string; url: string }>(
            "/profiles/me/avatar",
            form
          );
          return { path: data.path, error: null };
        } catch (err) {
          console.error("Error in uploadAvatar:", err);
          return { path: null, error: err };
        }
      },

      clearProfile: () => {
        set({
          profile: null,
          error: null,
          initialized: false,
          gateDismissed: false,
        });
      },

      dismissProfileGate: async () => {
        set({ gateDismissed: true });
        const user = getUser();
        if (user)
          await AsyncStorage.setItem(gateKey(user.id), "true").catch(() => {});
      },

      // Computed getters
      getDisplayName: () => {
        const { profile } = get();
        return profile?.full_name || profile?.email?.split("@")[0] || "User";
      },

      getAvatarUrl: () => {
        const { profile } = get();
        if (!profile?.avatar_url) return null;
        return getAvatarUrl(profile.avatar_url);
      },

      getInitials: () => {
        const { profile } = get();
        const name = profile?.full_name || profile?.email || "U";
        return name.charAt(0).toUpperCase();
      },
    }),
    {
      name: "tasknest.profile",
      storage: jsonStorage(),
      partialize: (s) => ({
        profile: s.profile,
        gateDismissed: s.gateDismissed,
      }),
    }
  )
);

// A queued profile edit reaches the server as one PATCH; the response wins.
registerHandler("profile.update", async ({ updates }) => {
  const data = await api.patch<Profile>("/profiles/me", updates);
  useProfileStore.setState({ profile: data });
});

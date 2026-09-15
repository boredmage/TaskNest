import { api, errorMessage, getUser } from "@/lib/api";
import { getAvatarUrl } from "@/lib/util";
import { UPDATE_PROFILE_REDIRECT_KEY } from "@/utils/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { create } from "zustand";

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
  }) => Promise<{ error: any }>;
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

export const useProfileStore = create<ProfileStore>((set, get) => ({
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
    } catch (err: unknown) {
      console.error("Error in fetchProfile:", err);
      set({
        loading: false,
        error: errorMessage(err, "Failed to fetch profile"),
      });
    } finally {
      set({ initialized: true });
    }
  },

  updateProfile: async (updates) => {
    try {
      if (!getUser()) {
        return { error: "User not authenticated" };
      }
      const data = await api.patch<Profile>("/profiles/me", {
        ...updates,
        // undefined means "leave unchanged"; the server ignores absent keys.
        date_of_birth: updates.date_of_birth,
      });
      set({ profile: data });
      return { error: null };
    } catch (err) {
      console.error("Error in updateProfile:", err);
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
}));

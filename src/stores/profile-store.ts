import { supabase } from "@/lib/supabase";
import { getAvatarUrl } from "@/lib/util";
import * as ImagePicker from "expo-image-picker";
import { create } from "zustand";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at?: string;
  updated_at?: string;
  date_of_birth?: string | undefined;
}

interface ProfileStore {
  profile: Profile | null;
  loading: boolean;
  error: string | null;

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

  // Computed getters
  getDisplayName: () => string;
  getAvatarUrl: () => string | null;
  getInitials: () => string;
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: null,
  loading: false,
  error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        set({ loading: false, error: "User not authenticated" });
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        set({ loading: false, error: error.message });
        return;
      }

      set({ profile: data, loading: false, error: null });
    } catch (err: any) {
      console.error("Error in fetchProfile:", err);
      set({ loading: false, error: err.message || "Failed to fetch profile" });
    }
  },

  updateProfile: async (updates) => {
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        return { error: "User not authenticated" };
      }

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", currentUser.id);

      if (error) {
        console.error("Error updating profile:", error);
        return { error };
      }

      // Refresh profile after update
      await get().fetchProfile();

      return { error: null };
    } catch (err) {
      console.error("Error in updateProfile:", err);
      return { error: err };
    }
  },

  uploadAvatar: async (image) => {
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        return { path: null, error: "User not authenticated" };
      }

      // Generate a unique filename
      const fileExt = image.uri.split(".").pop();
      const fileName = `${currentUser.id}.${fileExt}`;

      // Convert image to array buffer
      const arraybuffer = await fetch(image.uri).then((res) =>
        res.arrayBuffer()
      );

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(fileName, arraybuffer, {
          contentType: image.mimeType ?? "image/jpeg",
          upsert: true, // Replace if exists
        });

      if (error) {
        console.error("Error uploading avatar:", error);
        return { path: null, error };
      }

      return { path: data.path, error: null };
    } catch (err) {
      console.error("Error in uploadAvatar:", err);
      return { path: null, error: err };
    }
  },

  clearProfile: () => {
    set({ profile: null, error: null });
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

import { supabase } from "./supabase";

const getAvatarUrl = (avatarPathOrUrl: string | null): string | null => {
  if (!avatarPathOrUrl) return null;

  // If it's already a full URL, use it directly
  if (
    avatarPathOrUrl.startsWith("http://") ||
    avatarPathOrUrl.startsWith("https://") ||
    avatarPathOrUrl.startsWith("data:") ||
    avatarPathOrUrl.startsWith("file://") ||
    avatarPathOrUrl.startsWith("content://")
  ) {
    return avatarPathOrUrl;
  }

  // Otherwise, it's a storage path - convert to public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(avatarPathOrUrl);

  return publicUrl;
};

export { getAvatarUrl };

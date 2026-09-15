import { API_URL } from "./api";

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

  // Otherwise it's a server storage path (e.g. "avatars/<id>.jpg") served
  // from the API's /uploads mount.
  return `${API_URL}/uploads/${avatarPathOrUrl.replace(/^\/+/, "")}`;
};

export { getAvatarUrl };

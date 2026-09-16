import { useCachedAvatar } from "@/lib/avatar-cache";
import { Avatar } from "heroui-native";

type Props = {
  /** Remote avatar URL, or a local file:// / data: URI (used as-is). */
  uri: string | null | undefined;
  className?: string;
};

/**
 * `Avatar.Image` backed by the avatar disk cache: renders the cached file
 * when there is one, the remote URL until the download lands, and nothing
 * when there's no URI (so the Avatar falls back to its placeholder).
 */
export function CachedAvatarImage({ uri, className }: Props) {
  const resolved = useCachedAvatar(uri);
  if (!resolved) return null;
  return <Avatar.Image source={{ uri: resolved }} className={className} />;
}

export default CachedAvatarImage;

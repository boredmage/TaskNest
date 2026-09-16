import { useConnectivity } from "@/lib/connectivity";
import { useOutbox } from "@/lib/outbox";
import { Text, View } from "react-native";

/**
 * Thin strip under the status bar while offline or while queued changes are
 * still being sent. Hidden the rest of the time.
 */
export function OfflineBanner() {
  const online = useConnectivity((s) => s.online);
  const pending = useOutbox((s) => s.pending);
  const flushing = useOutbox((s) => s.flushing);

  if (online && pending === 0 && !flushing) return null;

  const message = !online
    ? pending > 0
      ? `You're offline · ${pending} change${pending === 1 ? "" : "s"} will sync when you're back online`
      : "You're offline · changes will sync when you're back online"
    : `Syncing ${pending} change${pending === 1 ? "" : "s"}…`;

  return (
    <View
      className={online ? "bg-main" : "bg-[#1B1B1B] dark:bg-[#3A3A3C]"}
      style={{ paddingVertical: 5, paddingHorizontal: 16 }}
    >
      <Text
        className="text-center text-xs font-medium text-white"
        numberOfLines={1}
      >
        {message}
      </Text>
    </View>
  );
}

export default OfflineBanner;

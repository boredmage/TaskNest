import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

/**
 * Ask for notification permission (once) and return this device's Expo push
 * token, or undefined when unavailable: simulator, permission declined, or
 * no EAS project id. Never throws or alerts — a declined permission is a
 * valid choice, not an error to nag about on every launch.
 */
export async function registerForPushNotificationsAsync(): Promise<
  string | undefined
> {
  if (!Device.isDevice) return undefined;

  try {
    if (Platform.OS === "android") {
      // Must match the channelId the server sends with each push.
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#72D000",
      });
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (existing !== "granted") {
      ({ status } = await Notifications.requestPermissionsAsync());
    }
    if (status !== "granted") return undefined;

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;
    if (!projectId) {
      console.warn(
        "[push] No EAS projectId in app config; cannot get a push token"
      );
      return undefined;
    }

    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    return data;
  } catch (error) {
    console.warn("[push] registration failed", error);
    return undefined;
  }
}

import {
  AppNotification,
  NotificationType,
} from "@/stores/notifications-store";
import React from "react";
import InviteNotification from "./invite";

const Notification = ({ notification }: { notification: AppNotification }) => {
  switch (notification.type) {
    case NotificationType.JOIN_REQUEST_RECEIVED:
      return <InviteNotification notification={notification} />;
    default:
      return null;
  }
};

export default Notification;

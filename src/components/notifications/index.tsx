import {
  AppNotification,
  NotificationType,
} from "@/stores/notifications-store";
import React from "react";
import FamilyInviteNotification from "./family-invite";
import GenericNotification from "./generic";
import InviteNotification from "./invite";

const Notification = ({ notification }: { notification: AppNotification }) => {
  switch (notification.type) {
    case NotificationType.JOIN_REQUEST_RECEIVED:
      return <InviteNotification notification={notification} />;
    case NotificationType.FAMILY_INVITE_RECEIVED:
      return <FamilyInviteNotification notification={notification} />;
    default:
      return <GenericNotification notification={notification} />;
  }
};

export default Notification;

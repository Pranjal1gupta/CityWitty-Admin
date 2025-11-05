import { Notification } from "@/app/types/Notification";

/**
 * Check if a notification is expired based on its expires_at date
 */
export function isNotificationExpired(notification: Notification): boolean {
  if (!notification.expires_at) return false;
  return new Date(notification.expires_at) < new Date();
}

/**
 * Check if a notification can be sent (not expired and not already sent)
 */
export function canSendNotification(notification: Notification): boolean {
  return !isNotificationExpired(notification) && notification.status === "draft";
}

/**
 * Check if a notification can be edited (not expired and not yet sent)
 */
export function canEditNotification(notification: Notification): boolean {
  return !isNotificationExpired(notification) && notification.status === "draft";
}
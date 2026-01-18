/**
 * Utility functions for web push notifications
 */

/**
 * Convert a base64 VAPID key to Uint8Array for subscription
 */
export function urlBase64ToUint8Array(base64String: string): BufferSource {
   const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
   const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

   const rawData = window.atob(base64);
   const outputArray = new Uint8Array(rawData.length);

   for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
   }
   return outputArray;
}

/**
 * Check if notifications are supported in the browser
 */
export function areNotificationsSupported(): boolean {
   return "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
   if (!areNotificationsSupported()) {
      return "denied";
   }
   return Notification.permission;
}

/**
 * Check if user has granted notification permission
 */
export function hasNotificationPermission(): boolean {
   return getNotificationPermission() === "granted";
}

/**
 * Validate a push subscription object
 */
export function isValidSubscription(subscription: PushSubscription | null): boolean {
   if (!subscription) return false;

   try {
      const json = subscription.toJSON();
      return !!(json.endpoint && json.keys?.p256dh && json.keys?.auth);
   } catch {
      return false;
   }
}

/**
 * Get user agent information for device identification
 */
export function getUserAgent(): string {
   return navigator.userAgent;
}

/**
 * Check if the current page is focused
 */
export function isPageFocused(): boolean {
   return document.visibilityState === "visible";
}

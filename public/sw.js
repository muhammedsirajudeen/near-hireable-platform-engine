// Service Worker for Push Notifications

/**
 * Handle incoming push notifications
 */
self.addEventListener("push", (event) => {
   console.log("[Service Worker] Push notification received", event);

   let data = {
      title: "New Notification",
      body: "You have a new message",
      icon: "/onboard.png",
      badge: "/onboard.png",
      tag: "chat-notification",
      requireInteraction: false,
      data: {
         url: "/",
         timestamp: Date.now(),
      },
   };

   // Parse notification data
   if (event.data) {
      try {
         const payload = event.data.json();
         data = {
            ...data,
            ...payload,
            data: {
               ...data.data,
               ...(payload.data || {}),
            },
         };
      } catch (err) {
         console.error("[Service Worker] Failed to parse push data:", err);
         data.body = event.data.text();
      }
   }

   console.log("[Service Worker] Showing notification:", data);

   // Show the notification
   event.waitUntil(
      self.registration
         .showNotification(data.title, {
            body: data.body,
            icon: data.icon,
            badge: data.badge,
            tag: data.tag,
            requireInteraction: data.requireInteraction,
            data: data.data,
            actions: data.actions || [],
            vibrate: [200, 100, 200],
            timestamp: data.data.timestamp,
         })
         .catch((error) => {
            console.error("[Service Worker] Failed to show notification:", error);
         })
   );
});

/**
 * Handle notification clicks
 */
self.addEventListener("notificationclick", (event) => {
   console.log("[Service Worker] Notification clicked:", event);

   event.notification.close();

   // Get the URL to open (default to homepage)
   const urlToOpen = event.notification.data?.url || "/";

   // Handle notification click
   event.waitUntil(
      clients
         .matchAll({
            type: "window",
            includeUncontrolled: true,
         })
         .then((clientList) => {
            // Check if there's already a window open
            for (const client of clientList) {
               if (client.url.includes(urlToOpen) && "focus" in client) {
                  return client.focus();
               }
            }

            // If no window is open, open a new one
            if (clients.openWindow) {
               return clients.openWindow(urlToOpen);
            }
         })
         .catch((error) => {
            console.error("[Service Worker] Failed to handle notification click:", error);
         })
   );
});

/**
 * Handle notification close
 */
self.addEventListener("notificationclose", (event) => {
   console.log("[Service Worker] Notification closed:", event);
   // You can track notification dismissals here if needed
});

"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { areNotificationsSupported, urlBase64ToUint8Array } from "@/utils/notificationHelpers";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

import axios from "axios";

/**
 * Subscribe user to push notifications
 */
async function subscribeUser(): Promise<boolean> {
   try {
      // Wait for service worker to be ready
      const registration = await navigator.serviceWorker.ready;

      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
         console.log("[Push] Already subscribed, updating subscription");
         // Send existing subscription to server to update
         await axios.post("/api/push/subscribe", existingSubscription.toJSON());
         return true;
      }

      // Convert VAPID key
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
         console.error("[Push] VAPID public key not found");
         return false;
      }

      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
         userVisibleOnly: true,
         applicationServerKey,
      });

      console.log("[Push] New subscription created");

      // Send subscription to server
      await axios.post("/api/push/subscribe", subscription.toJSON());

      console.log("[Push] Subscription saved to server");

      return true;
   } catch (error) {
      console.error("[Push] Subscription failed:", error);
      return false;
   }
}

export default function PushAutoCheck() {
   const { isAuthenticated, loading } = useAuth();
   const [open, setOpen] = useState(false);
   const [isSubscribing, setIsSubscribing] = useState(false);

   useEffect(() => {
      // Don't show popup if user is not authenticated or still loading
      if (!isAuthenticated || loading) return;

      // Check if notifications are supported
      if (!areNotificationsSupported()) {
         console.log("[Push] Notifications not supported in this browser");
         return;
      }

      // Don't show if already granted or denied
      if (Notification.permission === "granted") {
         // Auto-subscribe if permission already granted
         subscribeUser().catch(console.error);
         return;
      }

      if (Notification.permission === "denied") {
         console.log("[Push] Notification permission denied");
         return;
      }

      // Show popup if it's time
      // if (shouldShowPushPopup()) {
      setOpen(true);
      // }
   }, [isAuthenticated, loading]);

   const enableNotifications = async () => {
      setIsSubscribing(true);

      try {
         const permission = await Notification.requestPermission();

         if (permission === "granted") {
            const success = await subscribeUser();

            if (success) {
               console.log("[Push] Successfully subscribed to notifications");
               setOpen(false);
               // Store the timestamp when popup was shown
               // localStorage.setItem("push-popup-last-shown", Date.now().toString());
            } else {
               console.error("[Push] Failed to subscribe");
               alert("Failed to enable notifications. Please try again.");
            }
         } else if (permission === "denied") {
            console.log("[Push] User denied notification permission");
            setOpen(false);
            // Store the timestamp so we don't ask again soon
            // localStorage.setItem("push-popup-last-shown", Date.now().toString());
         }
      } catch (error) {
         console.error("[Push] Error enabling notifications:", error);
         alert("An error occurred. Please try again.");
      } finally {
         setIsSubscribing(false);
      }
   };

   const handleMaybeLater = () => {
      setOpen(false);
      // Store the timestamp so we ask again later
      // localStorage.setItem("push-popup-last-shown", Date.now().toString());
   };

   return (
      <Dialog open={open} onOpenChange={setOpen}>
         <DialogContent className="sm:max-w-md">
            <DialogHeader>
               <div className="flex items-center gap-3">
                  <Bell className="h-6 w-6 text-primary" />
                  <DialogTitle>Stay in the loop</DialogTitle>
               </div>

               <DialogDescription className="pt-2">Enable notifications to get real-time updates, messages, reminders and important alerts — even when the tab is closed.</DialogDescription>
            </DialogHeader>

            <DialogFooter className="gap-3">
               <Button variant="outline" onClick={handleMaybeLater} disabled={isSubscribing}>
                  Maybe later
               </Button>

               <Button onClick={enableNotifications} disabled={isSubscribing}>
                  {isSubscribing ? (
                     <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                        Enabling...
                     </>
                  ) : (
                     <>
                        <Bell className="mr-2 h-4 w-4" />
                        Enable notifications
                     </>
                  )}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
}

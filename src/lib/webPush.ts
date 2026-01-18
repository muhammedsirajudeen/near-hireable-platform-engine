import { PushSubscription, PushSubscriptionLean } from "@/models/PushSubscriptions";
import webpush from "web-push";

// Configure VAPID details
webpush.setVapidDetails("mailto:jasimihsan1234@gmail.com", process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);

/**
 * Notification payload interface
 */
export interface NotificationPayload {
   title: string;
   body: string;
   icon?: string;
   badge?: string;
   tag?: string;
   requireInteraction?: boolean;
   data?: {
      url?: string;
      conversationId?: string;
      [key: string]: string | number | boolean | undefined;
   };
   actions?: Array<{
      action: string;
      title: string;
      icon?: string;
   }>;
}

/**
 * Send push notification to a single subscription with retry logic
 */
async function sendToSubscription(subscription: PushSubscriptionLean, payload: NotificationPayload, retries = 2): Promise<boolean> {
   const subscriptionObject = {
      endpoint: subscription.endpoint,
      keys: {
         p256dh: subscription.keys.p256dh,
         auth: subscription.keys.auth,
      },
   };

   // Prepare notification payload
   const notificationPayload: NotificationPayload = {
      title: payload.title,
      body: payload.body,
      icon: payload.icon || "/onboard.png",
      badge: payload.badge || "/onboard.png",
      tag: payload.tag || "notification",
      requireInteraction: payload.requireInteraction || false,
      data: {
         url: payload.data?.url || "/",
         timestamp: Date.now(),
         ...payload.data,
      },
      actions: payload.actions || [],
   };

   for (let attempt = 0; attempt <= retries; attempt++) {
      try {
         await webpush.sendNotification(subscriptionObject, JSON.stringify(notificationPayload));
         console.log(`[Push] ✓ Notification sent successfully to ${subscription.endpoint.substring(0, 50)}...`);
         return true;
      } catch (error: unknown) {
         const statusCode = (error as { statusCode?: number })?.statusCode;

         // Handle different error types
         if (statusCode === 410 || statusCode === 404) {
            // Subscription is no longer valid - mark as inactive
            console.log(`[Push] ✗ Subscription expired/not found (${statusCode}), marking as inactive: ${subscription.endpoint.substring(0, 50)}...`);
            await PushSubscription.updateOne({ endpoint: subscription.endpoint }, { isActive: false });
            return false;
         }

         if (statusCode === 429) {
            // Rate limited - wait and retry
            console.log(`[Push] ⚠ Rate limited, attempt ${attempt + 1}/${retries + 1}`);
            if (attempt < retries) {
               await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
               continue;
            }
         }

         if (statusCode !== undefined && statusCode >= 500 && statusCode < 600) {
            // Server error - retry
            console.log(`[Push] ⚠ Server error (${statusCode}), attempt ${attempt + 1}/${retries + 1}`);
            if (attempt < retries) {
               await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
               continue;
            }
         }

         // Log other errors
         console.error(`[Push] ✗ Failed to send notification (attempt ${attempt + 1}/${retries + 1}):`, {
            statusCode,
            message: error instanceof Error ? error.message : "Unknown error",
            endpoint: subscription.endpoint.substring(0, 50) + "...",
         });

         if (attempt === retries) {
            return false;
         }
      }
   }

   return false;
}

/**
 * Send push notifications to multiple users
 */
export async function sendPushToUsers(userIds: string[], payload: NotificationPayload): Promise<{ sent: number; failed: number }> {
   try {
      // Find all active subscriptions for the users
      const subscriptions = await PushSubscription.find({
         userId: { $in: userIds },
         isActive: true,
      }).lean();

      if (subscriptions.length === 0) {
         console.log(`[Push] No active subscriptions found for ${userIds.length} user(s)`);
         return { sent: 0, failed: 0 };
      }

      console.log(`[Push] Sending notifications to ${subscriptions.length} subscription(s) for ${userIds.length} user(s)`);

      // Send notifications to all subscriptions
      const results = await Promise.allSettled(subscriptions.map((sub) => sendToSubscription(sub, payload)));

      const sent = results.filter((r) => r.status === "fulfilled" && r.value === true).length;
      const failed = results.length - sent;

      console.log(`[Push] Results: ${sent} sent, ${failed} failed`);

      return { sent, failed };
   } catch (error) {
      console.error("[Push] Error in sendPushToUsers:", error);
      return { sent: 0, failed: 0 };
   }
}

/**
 * Send push notifications to all admins
 */
export async function sendPushToAdmins(payload: NotificationPayload): Promise<{ sent: number; failed: number }> {
   try {
      // Import User model dynamically to avoid circular dependencies
      const { default: User } = await import("@/models/User");
      const { UserRole } = await import("@/types/enums/role.enum");

      // Find all admin users
      const adminUsers = await User.find({ role: UserRole.ADMIN }).select("_id").lean();

      if (adminUsers.length === 0) {
         console.log("[Push] No admin users found");
         return { sent: 0, failed: 0 };
      }

      const adminIds = adminUsers.map((admin) => admin._id.toString());

      console.log(`[Push] Sending notification to ${adminIds.length} admin(s)`);

      // Send push notifications to all admins
      return await sendPushToUsers(adminIds, payload);
   } catch (error) {
      console.error("[Push] Error in sendPushToAdmins:", error);
      return { sent: 0, failed: 0 };
   }
}

/**
 * Cleanup inactive subscriptions (can be run periodically)
 */
export async function cleanupInactiveSubscriptions(daysOld = 30): Promise<number> {
   try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await PushSubscription.deleteMany({
         isActive: false,
         updatedAt: { $lt: cutoffDate },
      });

      console.log(`[Push] Cleaned up ${result.deletedCount} inactive subscriptions older than ${daysOld} days`);

      return result.deletedCount;
   } catch (error) {
      console.error("[Push] Error cleaning up subscriptions:", error);
      return 0;
   }
}

export default webpush;

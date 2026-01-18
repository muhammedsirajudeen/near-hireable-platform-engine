import { sendErrorResponse } from "@/error/sendErrorResponse";
import connectDB from "@/lib/db";
import { authenticateRequest } from "@/middleware/auth.middleware";
import { PushSubscription } from "@/models/PushSubscriptions";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/push/subscribe - Subscribe to push notifications
 */
export async function POST(req: NextRequest) {
   try {
      await connectDB();

      // Authenticate user and get userId from JWT token
      const user = await authenticateRequest(req);
      const userId = user.userId;

      const subscription = await req.json();

      // Validate subscription object
      if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
         return NextResponse.json({ success: false, error: "Invalid subscription object" }, { status: 400 });
      }

      // Get user agent for device identification
      const userAgent = req.headers.get("user-agent") || "Unknown";

      // Check if this exact subscription already exists
      const existingSubscription = await PushSubscription.findOne({
         endpoint: subscription.endpoint,
      });

      if (existingSubscription) {
         // Update existing subscription
         await PushSubscription.updateOne(
            { endpoint: subscription.endpoint },
            {
               keys: subscription.keys,
               userId,
               userAgent,
               expirationTime: subscription.expirationTime || null,
               isActive: true,
               updatedAt: new Date(),
            }
         );

         console.log(`[Push] Updated subscription for user ${userId}, endpoint: ${subscription.endpoint.substring(0, 50)}...`);

         return NextResponse.json(
            {
               success: true,
               message: "Subscription updated successfully",
            },
            { status: 200 }
         );
      }

      // Create new subscription
      await PushSubscription.create({
         endpoint: subscription.endpoint,
         keys: subscription.keys,
         userId,
         userAgent,
         expirationTime: subscription.expirationTime || null,
         isActive: true,
      });

      console.log(`[Push] Created new subscription for user ${userId}, endpoint: ${subscription.endpoint.substring(0, 50)}...`);

      return NextResponse.json(
         {
            success: true,
            message: "Subscribed successfully",
         },
         { status: 201 }
      );
   } catch (error) {
      console.error("[Push] Subscription error:", error);
      return sendErrorResponse(error);
   }
}

/**
 * DELETE /api/push/subscribe - Unsubscribe from push notifications
 */
export async function DELETE(req: NextRequest) {
   try {
      await connectDB();

      // Authenticate user
      const user = await authenticateRequest(req);
      const userId = user.userId;

      const { endpoint } = await req.json();

      if (!endpoint) {
         return NextResponse.json({ success: false, error: "Endpoint is required" }, { status: 400 });
      }

      // Soft delete the subscription
      const result = await PushSubscription.updateOne(
         {
            endpoint,
            userId,
         },
         {
            isActive: false,
         }
      );

      if (result.modifiedCount === 0) {
         return NextResponse.json({ success: false, error: "Subscription not found" }, { status: 404 });
      }

      console.log(`[Push] Unsubscribed user ${userId} from endpoint: ${endpoint.substring(0, 50)}...`);

      return NextResponse.json({
         success: true,
         message: "Unsubscribed successfully",
      });
   } catch (error) {
      console.error("[Push] Unsubscribe error:", error);
      return sendErrorResponse(error);
   }
}

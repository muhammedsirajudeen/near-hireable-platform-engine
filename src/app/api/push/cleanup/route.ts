import { sendErrorResponse } from "@/error/sendErrorResponse";
import connectDB from "@/lib/db";
import { cleanupInactiveSubscriptions } from "@/lib/webPush";
import { requireAdmin } from "@/middleware/auth.middleware";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/push/cleanup - Cleanup inactive subscriptions (Admin only)
 */
export async function POST(req: NextRequest) {
   try {
      // Only admins can trigger cleanup
      await requireAdmin(req);
      await connectDB();

      const { daysOld = 30 } = await req.json().catch(() => ({}));

      const deletedCount = await cleanupInactiveSubscriptions(daysOld);

      return NextResponse.json({
         success: true,
         message: `Cleaned up ${deletedCount} inactive subscriptions`,
         deletedCount,
      });
   } catch (error) {
      console.error("[Push] Cleanup error:", error);
      return sendErrorResponse(error);
   }
}

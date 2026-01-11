import { authService } from "@/di/composer";
import { sendErrorResponse } from "@/error/sendErrorResponse";
import { authenticateRequest } from "@/middleware/auth.middleware";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
   try {
      const payload = await authenticateRequest(request);

      const user = await authService.getCurrentUser(payload.userId);

      return NextResponse.json(
         {
            success: true,
            user: {
               id: user.id,
               name: user.name,
               email: user.email,
               role: user.role,
               prdStatus: user.prdStatus || "none",
            },
         },
         { status: 200 }
      );
   } catch (error) {
      return sendErrorResponse(error);
   }
}

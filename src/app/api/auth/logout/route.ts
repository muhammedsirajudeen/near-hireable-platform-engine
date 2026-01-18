import { sendErrorResponse } from "@/error/sendErrorResponse";
import { clearAuthCookies } from "@/lib/cookie.util";
import { NextRequest, NextResponse } from "next/server";

export async function POST(_request: NextRequest) {
   try {
      const response = NextResponse.json(
         {
            success: true,
            message: "Logged out successfully",
         },
         { status: 200 }
      );

      clearAuthCookies(response);

      return response;
   } catch (error) {
      return sendErrorResponse(error);
   }
}

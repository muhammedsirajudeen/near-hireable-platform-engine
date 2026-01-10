import { authService } from "@/di/composer";
import { sendErrorResponse } from "@/error/sendErrorResponse";
import { setAuthCookies } from "@/lib/cookie.util";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
   try {
      const refreshToken = request.cookies.get("refreshToken")?.value;

      if (!refreshToken) {
         return NextResponse.json(
            {
               success: false,
               error: "Refresh token not found",
            },
            { status: 401 }
         );
      }

      const tokens = await authService.refreshTokens(refreshToken);

      const response = NextResponse.json(
         {
            success: true,
            message: "Tokens refreshed successfully",
         },
         { status: 200 }
      );

      setAuthCookies(response, tokens.accessToken, tokens.refreshToken);

      return response;
   } catch (error) {
      return sendErrorResponse(error);
   }
}

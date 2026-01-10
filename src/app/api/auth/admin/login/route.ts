import { authService } from "@/di/composer";
import { sendErrorResponse } from "@/error/sendErrorResponse";
import { setAuthCookies } from "@/lib/cookie.util";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
   try {
      const body = await request.json();
      const { password } = body;

      if (!password) {
         return NextResponse.json(
            {
               success: false,
               error: "Password is required",
            },
            { status: 400 }
         );
      }

      const { tokens, user } = await authService.adminLogin(password);

      const response = NextResponse.json(
         {
            success: true,
            user: {
               id: user.id,
               name: user.name,
               email: user.email,
               role: user.role,
            },
         },
         { status: 200 }
      );

      setAuthCookies(response, tokens.accessToken, tokens.refreshToken);

      return response;
   } catch (error) {
      return sendErrorResponse(error);
   }
}

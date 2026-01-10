import { authService } from "@/di/composer";
import { sendErrorResponse } from "@/error/sendErrorResponse";
import { setAuthCookies } from "@/lib/cookie.util";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
   try {
      const body = await request.json();
      const { name, email, password } = body;

      if (!name || !email || !password) {
         return NextResponse.json(
            {
               success: false,
               error: "Name, email, and password are required",
            },
            { status: 400 }
         );
      }

      const { tokens, user } = await authService.userSignup(name, email, password);

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
         { status: 201 }
      );

      setAuthCookies(response, tokens.accessToken, tokens.refreshToken);

      return response;
   } catch (error) {
      return sendErrorResponse(error);
   }
}

import { authService } from "@/di/composer";
import { sendErrorResponse } from "@/error/sendErrorResponse";
import { setAuthCookies } from "@/lib/cookie.util";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { credential } = await request.json();

        if (!credential) {
            return NextResponse.json(
                { success: false, error: "Google credential is required" },
                { status: 400 }
            );
        }

        const { tokens, user } = await authService.googleAuth(credential);

        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                prdStatus: user.prdStatus || "none",
            },
        });

        setAuthCookies(response, tokens.accessToken, tokens.refreshToken);

        return response;
    } catch (error) {
        return sendErrorResponse(error);
    }
}

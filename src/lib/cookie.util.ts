import { NextResponse } from "next/server";

const COOKIE_OPTIONS = {
   httpOnly: true,
   secure: process.env.NODE_ENV === "production",
   sameSite: "lax" as const,
   path: "/",
};

export function setAuthCookies(response: NextResponse, accessToken: string, refreshToken: string): NextResponse {
   response.cookies.set("accessToken", accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60, // 15 minutes
   });

   response.cookies.set("refreshToken", refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60, // 7 days
   });

   return response;
}

export function clearAuthCookies(response: NextResponse): NextResponse {
   response.cookies.set("accessToken", "", {
      ...COOKIE_OPTIONS,
      maxAge: 0,
   });

   response.cookies.set("refreshToken", "", {
      ...COOKIE_OPTIONS,
      maxAge: 0,
   });

   return response;
}

export function getTokenFromCookies(cookieHeader: string | null, tokenName: string): string | null {
   if (!cookieHeader) return null;

   const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
   }, {} as Record<string, string>);

   return cookies[tokenName] || null;
}

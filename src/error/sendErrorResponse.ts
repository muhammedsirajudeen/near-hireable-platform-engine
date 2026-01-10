import RouteError from "@/error/routeError";
import { HttpStatusCode } from "axios";
import { NextResponse } from "next/server";

/**
 * Reusable helper to send consistent API error responses.
 */
export function sendErrorResponse(error: unknown) {
   console.error("❌ API Error:", error);

   // 🟥 Handle RouteError (custom app errors)
   if (error instanceof RouteError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
   }

   // 🟧 Handle system or Prisma errors
   if (error instanceof Error) {
      return NextResponse.json({ success: false, message: error.message }, { status: HttpStatusCode.InternalServerError });
   }

   // 🟨 Fallback for unexpected error type
   return NextResponse.json({ success: false, message: "Internal server error" }, { status: HttpStatusCode.InternalServerError });
}

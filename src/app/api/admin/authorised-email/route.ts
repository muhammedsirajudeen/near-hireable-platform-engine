import { authorisedEmailService } from "@/di/composer";
import { ERROR_MESSAGES } from "@/error/messages";
import RouteError from "@/error/routeError";
import { sendErrorResponse } from "@/error/sendErrorResponse";
import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
   try {
      const emails = await authorisedEmailService.getAllAuthorisedEmails();

      return NextResponse.json({
         success: true,
         data: emails,
      });
   } catch (error) {
      return sendErrorResponse(error);
   }
}

export async function POST(request: NextRequest) {
   try {
      const body = await request.json();

      const { email } = body;

      if (!email) {
         throw new RouteError(ERROR_MESSAGES.INVALID_INPUT, HttpStatusCode.BadRequest);
      }

      const user = await authorisedEmailService.createAuthorisedEmail({ email });

      return NextResponse.json(
         {
            success: true,
            data: user,
         },
         { status: 201 }
      );
   } catch (error) {
      return sendErrorResponse(error);
   }
}

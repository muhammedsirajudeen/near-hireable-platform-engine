import { userService } from "@/di/composer";
import { sendErrorResponse } from "@/error/sendErrorResponse";
import { NextRequest, NextResponse } from "next/server";

// GET /api/users - Fetch all users
export async function GET() {
   try {
      const users = await userService.getAllUsers();

      return NextResponse.json({
         success: true,
         data: users,
      });
   } catch (error) {
      return sendErrorResponse(error);
   }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
   try {
      const body = await request.json();

      const { name, email } = body;

      if (!name || !email) {
         return NextResponse.json(
            {
               success: false,
               error: "Name and email are required",
            },
            { status: 400 }
         );
      }

      const user = await userService.createUser({ name, email });

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

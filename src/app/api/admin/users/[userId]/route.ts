import dbConnect from "@/lib/db";
import { authenticateRequest } from "@/middleware/auth.middleware";
import User from "@/models/User";
import { UserRole } from "@/types/enums/role.enum";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
   try {
      const payload = await authenticateRequest(req);
      if (payload.role !== UserRole.ADMIN) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      await dbConnect();

      const { userId } = await params;
      const user = await User.findById(userId).select("name email prdStatus createdAt role");

      console.log("user", user);

      if (!user) {
         return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json(user);
   } catch (error) {
      console.error("Error fetching user:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
   }
}

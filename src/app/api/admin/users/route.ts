import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/middleware/auth.middleware";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { UserRole } from "@/types/enums/role.enum";

export async function GET(req: NextRequest) {
    try {
        const payload = await authenticateRequest(req);
        if (payload.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 }); // 403 for Forbidden
        }

        await dbConnect();

        const users = await User.find({ role: UserRole.USER }).select(
            "name email prdStatus createdAt"
        );

        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/middleware/auth.middleware";
import dbConnect from "@/lib/db";
import UserModule from "@/models/UserModule";
import { UserRole } from "@/types/enums/role.enum";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const payload = await authenticateRequest(req);
        if (payload.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { userId } = await params;
        await dbConnect();

        const userModule = await UserModule.findOne({ userId });

        if (!userModule) {
            return NextResponse.json(
                { error: "User modules not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(userModule.modules);
    } catch (error) {
        console.error("Error fetching user modules:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

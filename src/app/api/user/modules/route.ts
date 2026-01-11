import { authenticateRequest } from "@/middleware/auth.middleware";
import connectDB from "@/lib/db";
import UserModule, { ModuleStatus } from "@/models/UserModule";
import User from "@/models/User";
import { sendErrorResponse } from "@/error/sendErrorResponse";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const payload = await authenticateRequest(request);
        await connectDB();

        let userModules = await UserModule.findOne({ userId: payload.userId });

        if (!userModules) {
            // Check if user is approved but missing modules (migration or sync issue)
            const user = await User.findById(payload.userId);

            if (user && user.prdStatus === "approved") {
                const modules = Array.from({ length: 30 }, (_, i) => ({
                    moduleId: i + 1,
                    status: i === 0 ? ModuleStatus.UNLOCKED : ModuleStatus.LOCKED,
                }));

                userModules = await UserModule.create({
                    userId: payload.userId,
                    modules,
                });
            } else {
                return NextResponse.json({
                    success: true,
                    data: null,
                    message: "No modules found for this user"
                });
            }
        }

        return NextResponse.json({
            success: true,
            data: userModules,
        });
    } catch (error) {
        return sendErrorResponse(error);
    }
}

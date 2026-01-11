import connectDB from "@/lib/db";
import { sendErrorResponse } from "@/error/sendErrorResponse";
import { authenticateRequest } from "@/middleware/auth.middleware";
import PRD, { PRDStatus } from "@/models/PRD";
import User from "@/models/User";
import UserModule, { ModuleStatus } from "@/models/UserModule";
import { UserRole } from "@/types/enums/role.enum";
import { NextRequest, NextResponse } from "next/server";

// GET - List all PRDs (admin only)
export async function GET(request: NextRequest) {
    try {
        const payload = await authenticateRequest(request);

        if (payload.role !== UserRole.ADMIN) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
        }

        await connectDB();

        const prds = await PRD.find()
            .populate("userId", "name email")
            .sort({ submittedAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            data: prds,
        });
    } catch (error) {
        return sendErrorResponse(error);
    }
}

// PUT - Approve/reject PRD (admin only)
export async function PUT(request: NextRequest) {
    try {
        const payload = await authenticateRequest(request);

        if (payload.role !== UserRole.ADMIN) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
        }

        const body = await request.json();
        const { prdId, status } = body;

        if (!prdId || !status) {
            return NextResponse.json(
                { success: false, error: "PRD ID and status are required" },
                { status: 400 }
            );
        }

        if (![PRDStatus.APPROVED, PRDStatus.REJECTED].includes(status)) {
            return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
        }

        await connectDB();

        const updateData: Record<string, unknown> = {
            status,
        };

        if (status === PRDStatus.APPROVED) {
            updateData.approvedAt = new Date();
            updateData.rejectedAt = undefined;
        } else {
            updateData.rejectedAt = new Date();
            updateData.approvedAt = undefined;
        }

        const prd = await PRD.findByIdAndUpdate(prdId, updateData, { new: true });

        if (!prd) {
            return NextResponse.json({ success: false, error: "PRD not found" }, { status: 404 });
        }

        // Update user's PRD status
        const newPrdStatus = status === PRDStatus.APPROVED ? "approved" : "pending";
        await User.findByIdAndUpdate(prd.userId, { prdStatus: newPrdStatus });

        // Initialize modules if approved
        if (status === PRDStatus.APPROVED) {
            const existingModules = await UserModule.findOne({ userId: prd.userId });
            if (!existingModules) {
                const modules = Array.from({ length: 30 }, (_, i) => ({
                    moduleId: i + 1,
                    status: i === 0 ? ModuleStatus.UNLOCKED : ModuleStatus.LOCKED,
                }));

                await UserModule.create({
                    userId: prd.userId,
                    modules,
                });
            }
        }

        return NextResponse.json({
            success: true,
            data: prd,
        });
    } catch (error) {
        return sendErrorResponse(error);
    }
}

import connectDB from "@/lib/db";
import { sendErrorResponse } from "@/error/sendErrorResponse";
import { authenticateRequest } from "@/middleware/auth.middleware";
import PRD, { PRDStatus } from "@/models/PRD";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

// GET - Fetch user's PRD
export async function GET(request: NextRequest) {
    try {
        const payload = await authenticateRequest(request);
        await connectDB();

        const prd = await PRD.findOne({ userId: payload.userId }).lean();

        return NextResponse.json({
            success: true,
            data: prd,
        });
    } catch (error) {
        return sendErrorResponse(error);
    }
}

// POST - Create new PRD
export async function POST(request: NextRequest) {
    try {
        const payload = await authenticateRequest(request);
        const body = await request.json();

        const { problemStatement, targetUsers, keyFeatures, successMetrics, timeline, additionalNotes } = body;

        if (!problemStatement || !targetUsers || !keyFeatures) {
            return NextResponse.json(
                { success: false, error: "Problem statement, target users, and key features are required" },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if PRD already exists
        const existingPRD = await PRD.findOne({ userId: payload.userId });
        if (existingPRD) {
            return NextResponse.json(
                { success: false, error: "PRD already exists. Use PUT to update." },
                { status: 409 }
            );
        }

        // Create new PRD
        const prd = await PRD.create({
            userId: payload.userId,
            problemStatement,
            targetUsers,
            keyFeatures,
            successMetrics,
            timeline,
            additionalNotes,
            status: PRDStatus.PENDING,
        });

        // Update user's PRD status
        await User.findByIdAndUpdate(payload.userId, { prdStatus: "pending" });

        return NextResponse.json({
            success: true,
            data: prd,
        });
    } catch (error) {
        return sendErrorResponse(error);
    }
}

// PUT - Update existing PRD
export async function PUT(request: NextRequest) {
    try {
        const payload = await authenticateRequest(request);
        const body = await request.json();

        const { problemStatement, targetUsers, keyFeatures, successMetrics, timeline, additionalNotes } = body;

        if (!problemStatement || !targetUsers || !keyFeatures) {
            return NextResponse.json(
                { success: false, error: "Problem statement, target users, and key features are required" },
                { status: 400 }
            );
        }

        await connectDB();

        // Update PRD and reset to pending status
        const prd = await PRD.findOneAndUpdate(
            { userId: payload.userId },
            {
                problemStatement,
                targetUsers,
                keyFeatures,
                successMetrics,
                timeline,
                additionalNotes,
                status: PRDStatus.PENDING,
                submittedAt: new Date(),
                approvedAt: undefined,
                rejectedAt: undefined,
            },
            { new: true }
        );

        if (!prd) {
            return NextResponse.json({ success: false, error: "PRD not found" }, { status: 404 });
        }

        // Update user's PRD status
        await User.findByIdAndUpdate(payload.userId, { prdStatus: "pending" });

        return NextResponse.json({
            success: true,
            data: prd,
        });
    } catch (error) {
        return sendErrorResponse(error);
    }
}

import connectDB from "@/lib/db";
import { sendErrorResponse } from "@/error/sendErrorResponse";
import { authenticateRequest } from "@/middleware/auth.middleware";
import PRD from "@/models/PRD";
import { UserRole } from "@/types/enums/role.enum";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
    params: Promise<{ prdId: string }>;
}

// POST - Add a new note to a PRD
export async function POST(request: NextRequest, context: RouteContext) {
    try {
        const payload = await authenticateRequest(request);

        if (payload.role !== UserRole.ADMIN) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 403 }
            );
        }

        const { prdId } = await context.params;
        const body = await request.json();
        const { content } = body;

        if (!content || content.trim().length === 0) {
            return NextResponse.json(
                { success: false, error: "Note content is required" },
                { status: 400 }
            );
        }

        if (content.length > 500) {
            return NextResponse.json(
                { success: false, error: "Note cannot exceed 500 characters" },
                { status: 400 }
            );
        }

        await connectDB();

        const newNote = {
            id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            content: content.trim(),
            createdAt: new Date(),
            createdBy: payload.userId,
        };

        const prd = await PRD.findByIdAndUpdate(
            prdId,
            { $push: { adminNotes: newNote } },
            { new: true }
        ).populate("userId", "name email");

        if (!prd) {
            return NextResponse.json(
                { success: false, error: "PRD not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: prd,
        });
    } catch (error) {
        return sendErrorResponse(error);
    }
}

// DELETE - Remove a note from a PRD
export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const payload = await authenticateRequest(request);

        if (payload.role !== UserRole.ADMIN) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 403 }
            );
        }

        const { prdId } = await context.params;
        const { searchParams } = new URL(request.url);
        const noteId = searchParams.get("noteId");

        if (!noteId) {
            return NextResponse.json(
                { success: false, error: "Note ID is required" },
                { status: 400 }
            );
        }

        await connectDB();

        const prd = await PRD.findByIdAndUpdate(
            prdId,
            { $pull: { adminNotes: { id: noteId } } },
            { new: true }
        ).populate("userId", "name email");

        if (!prd) {
            return NextResponse.json(
                { success: false, error: "PRD not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: prd,
        });
    } catch (error) {
        return sendErrorResponse(error);
    }
}

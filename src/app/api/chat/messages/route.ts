import { authenticateRequest } from "@/middleware/auth.middleware";
import { sendErrorResponse } from "@/error/sendErrorResponse";
import ChatMessage from "@/models/ChatMessage";
import { UserRole } from "@/types/enums/role.enum";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";

// GET /api/chat/messages - Fetch messages for current user's conversation
export async function GET(request: NextRequest) {
    try {
        const payload = await authenticateRequest(request);

        // Only non-admin users can use this endpoint
        if (payload.role === UserRole.ADMIN) {
            return NextResponse.json(
                { success: false, error: "Admins should use admin chat endpoints" },
                { status: 403 }
            );
        }

        await connectDB();

        const conversationId = `user_${payload.userId}`;

        const messages = await ChatMessage.find({ conversationId })
            .sort({ createdAt: 1 })
            .limit(100)
            .lean();

        // Mark unread messages from admin as read
        await ChatMessage.updateMany(
            { conversationId, senderRole: "admin", read: false },
            { $set: { read: true } }
        );

        return NextResponse.json({
            success: true,
            messages: messages.map((msg) => ({
                id: msg._id?.toString(),
                senderId: msg.senderId?.toString(),
                senderRole: msg.senderRole,
                message: msg.message,
                read: msg.read,
                createdAt: msg.createdAt,
            })),
            conversationId,
        });
    } catch (error) {
        return sendErrorResponse(error);
    }
}

// POST /api/chat/messages - Send a new message
export async function POST(request: NextRequest) {
    try {
        const payload = await authenticateRequest(request);

        // Only non-admin users can use this endpoint
        if (payload.role === UserRole.ADMIN) {
            return NextResponse.json(
                { success: false, error: "Admins should use admin chat endpoints" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { message } = body;

        if (!message || typeof message !== "string" || message.trim().length === 0) {
            return NextResponse.json(
                { success: false, error: "Message is required" },
                { status: 400 }
            );
        }

        if (message.length > 2000) {
            return NextResponse.json(
                { success: false, error: "Message cannot exceed 2000 characters" },
                { status: 400 }
            );
        }

        await connectDB();

        const conversationId = `user_${payload.userId}`;

        const chatMessage = await ChatMessage.create({
            senderId: payload.userId,
            senderRole: "user",
            message: message.trim(),
            conversationId,
            read: false,
        });

        return NextResponse.json({
            success: true,
            message: {
                id: chatMessage._id?.toString(),
                senderId: chatMessage.senderId?.toString(),
                senderRole: chatMessage.senderRole,
                message: chatMessage.message,
                read: chatMessage.read,
                createdAt: chatMessage.createdAt,
            },
        });
    } catch (error) {
        return sendErrorResponse(error);
    }
}

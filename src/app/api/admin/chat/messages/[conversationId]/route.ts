import { requireAdmin } from "@/middleware/auth.middleware";
import { sendErrorResponse } from "@/error/sendErrorResponse";
import ChatMessage from "@/models/ChatMessage";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";

interface RouteParams {
    params: Promise<{ conversationId: string }>;
}

// GET /api/admin/chat/messages/[conversationId] - Fetch messages for a conversation
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const payload = await requireAdmin(request);
        const { conversationId } = await params;

        if (!conversationId) {
            return NextResponse.json(
                { success: false, error: "Conversation ID is required" },
                { status: 400 }
            );
        }

        await connectDB();

        const messages = await ChatMessage.find({ conversationId })
            .sort({ createdAt: 1 })
            .limit(200)
            .lean();

        // Mark all user messages as read
        await ChatMessage.updateMany(
            { conversationId, senderRole: "user", read: false },
            { $set: { read: true } }
        );

        // Get user info
        const odUserId = conversationId.replace("user_", "");
        const userData = await User.findById(odUserId).lean();

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
            user: userData
                ? {
                    id: userData._id?.toString(),
                    name: userData.name,
                    email: userData.email,
                }
                : null,
            adminId: payload.userId,
        });
    } catch (error) {
        return sendErrorResponse(error);
    }
}

// POST /api/admin/chat/messages/[conversationId] - Admin sends reply
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const payload = await requireAdmin(request);
        const { conversationId } = await params;

        if (!conversationId) {
            return NextResponse.json(
                { success: false, error: "Conversation ID is required" },
                { status: 400 }
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

        const chatMessage = await ChatMessage.create({
            senderId: payload.userId,
            senderRole: "admin",
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

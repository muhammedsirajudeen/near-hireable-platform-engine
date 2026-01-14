import { requireAdmin } from "@/middleware/auth.middleware";
import { sendErrorResponse } from "@/error/sendErrorResponse";
import ChatMessage from "@/models/ChatMessage";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";

interface ConversationSummary {
    conversationId: string;
    userId: string;
    userName: string;
    userEmail: string;
    lastMessage: string;
    lastMessageAt: Date;
    unreadCount: number;
}

// GET /api/admin/chat/conversations - List all user conversations
export async function GET(request: NextRequest) {
    try {
        await requireAdmin(request);

        await connectDB();

        // Aggregate to get unique conversations with last message and unread count
        const conversations = await ChatMessage.aggregate([
            {
                $group: {
                    _id: "$conversationId",
                    lastMessage: { $last: "$message" },
                    lastMessageAt: { $max: "$createdAt" },
                    lastSenderRole: { $last: "$senderRole" },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { $and: [{ $eq: ["$senderRole", "user"] }, { $eq: ["$read", false] }] },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
            { $sort: { lastMessageAt: -1 } },
        ]);

        // Extract user IDs from conversation IDs and fetch user details
        const userIds = conversations.map((conv) => conv._id.replace("user_", ""));
        const users = await User.find({ _id: { $in: userIds } }).lean();
        const userMap = new Map(users.map((u) => [u._id.toString(), u]));

        const conversationSummaries: ConversationSummary[] = conversations.map((conv) => {
            const odUserId = conv._id.replace("user_", "");
            const userData = userMap.get(odUserId);
            return {
                conversationId: conv._id,
                userId: odUserId,
                userName: userData?.name || "Unknown User",
                userEmail: userData?.email || "",
                lastMessage: conv.lastMessage,
                lastMessageAt: conv.lastMessageAt,
                unreadCount: conv.unreadCount,
            };
        });

        return NextResponse.json({
            success: true,
            conversations: conversationSummaries,
        });
    } catch (error) {
        return sendErrorResponse(error);
    }
}

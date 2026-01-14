import mongoose, { Document, Model, models, Schema, Types } from "mongoose";

export interface IChatMessageDocument extends Document {
    senderId: Types.ObjectId;
    senderRole: "user" | "admin";
    message: string;
    conversationId: string; // Format: user_${userId}
    read: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessageDocument>(
    {
        senderId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Sender ID is required"],
        },
        senderRole: {
            type: String,
            enum: ["user", "admin"],
            required: [true, "Sender role is required"],
        },
        message: {
            type: String,
            required: [true, "Message is required"],
            maxlength: [2000, "Message cannot exceed 2000 characters"],
        },
        conversationId: {
            type: String,
            required: [true, "Conversation ID is required"],
            index: true,
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient querying
ChatMessageSchema.index({ conversationId: 1, createdAt: -1 });

const ChatMessage: Model<IChatMessageDocument> =
    models.ChatMessage || mongoose.model<IChatMessageDocument>("ChatMessage", ChatMessageSchema);

export default ChatMessage;

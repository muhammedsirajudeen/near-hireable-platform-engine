"use client";

import axiosInstance from "@/lib/axiosInstance";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/enums/role.enum";
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

export interface ChatMessage {
    id: string;
    senderId: string;
    senderRole: "user" | "admin";
    message: string;
    read: boolean;
    createdAt: string;
}

interface ChatContextType {
    isOpen: boolean;
    messages: ChatMessage[];
    unreadCount: number;
    isLoading: boolean;
    isSending: boolean;
    toggleChat: () => void;
    openChat: () => void;
    closeChat: () => void;
    sendMessage: (message: string) => Promise<void>;
    fetchMessages: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
};

interface ChatProviderProps {
    children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Only enable chat for non-admin authenticated users
    const isChatEnabled = isAuthenticated && user && user.role !== UserRole.ADMIN;

    const fetchMessages = useCallback(async () => {
        if (!isChatEnabled) return;

        try {
            const response = await axiosInstance.get("/chat/messages");
            if (response.data.success) {
                setMessages(response.data.messages);
                // Count unread messages from admin
                const unread = response.data.messages.filter(
                    (msg: ChatMessage) => msg.senderRole === "admin" && !msg.read
                ).length;
                setUnreadCount(unread);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    }, [isChatEnabled]);

    const sendMessage = async (message: string) => {
        if (!isChatEnabled || !message.trim()) return;

        setIsSending(true);
        try {
            const response = await axiosInstance.post("/chat/messages", { message });
            if (response.data.success) {
                setMessages((prev) => [...prev, response.data.message]);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            throw error;
        } finally {
            setIsSending(false);
        }
    };

    const toggleChat = () => setIsOpen((prev) => !prev);
    const openChat = () => setIsOpen(true);
    const closeChat = () => setIsOpen(false);

    // Initial fetch when chat enabled
    useEffect(() => {
        if (isChatEnabled) {
            setIsLoading(true);
            fetchMessages().finally(() => setIsLoading(false));
        } else {
            setMessages([]);
            setUnreadCount(0);
        }
    }, [isChatEnabled, fetchMessages]);

    // Polling every 10 seconds
    useEffect(() => {
        if (!isChatEnabled) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        intervalRef.current = setInterval(fetchMessages, 10000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isChatEnabled, fetchMessages]);

    // When chat opens, mark messages as read (happens via API on fetch)
    useEffect(() => {
        if (isOpen && isChatEnabled) {
            fetchMessages();
        }
    }, [isOpen, isChatEnabled, fetchMessages]);

    return (
        <ChatContext.Provider
            value={{
                isOpen,
                messages,
                unreadCount,
                isLoading,
                isSending,
                toggleChat,
                openChat,
                closeChat,
                sendMessage,
                fetchMessages,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

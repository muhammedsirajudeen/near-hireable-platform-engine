"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { UserRole } from "@/types/enums/role.enum";

export default function FloatingChatButton() {
    const { user, isAuthenticated } = useAuth();
    const { toggleChat, unreadCount, isOpen } = useChat();

    // Only show for authenticated non-admin users
    if (!isAuthenticated || !user || user.role === UserRole.ADMIN) {
        return null;
    }

    // Hide button when chat is open
    if (isOpen) {
        return null;
    }

    return (
        <button
            onClick={toggleChat}
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Open chat with admin"
        >
            {/* Chat Icon */}
            <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
            </svg>

            {/* Unread Badge */}
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                </span>
            )}
        </button>
    );
}

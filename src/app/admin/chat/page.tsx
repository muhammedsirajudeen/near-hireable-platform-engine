"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import axiosInstance from "@/lib/axiosInstance";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Conversation {
    conversationId: string;
    userId: string;
    userName: string;
    userEmail: string;
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: number;
}

interface User {
    id: string;
    name: string;
    email: string;
}

export default function AdminChatPage() {
    const router = useRouter();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // New chat dialog state
    const [isNewChatOpen, setIsNewChatOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchConversations = async () => {
        try {
            const response = await axiosInstance.get("/admin/chat/conversations");
            if (response.data.success) {
                setConversations(response.data.conversations);
            }
        } catch (err) {
            console.error("Error fetching conversations:", err);
            setError("Failed to load conversations");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const response = await axiosInstance.get("/admin/users");
            // API returns array directly, map _id to id
            const usersData = response.data.map((u: { _id: string; name: string; email: string }) => ({
                id: u._id,
                name: u.name,
                email: u.email,
            }));
            setUsers(usersData);
        } catch (err) {
            console.error("Error fetching users:", err);
        } finally {
            setUsersLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
        const intervalId = setInterval(fetchConversations, 10000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (isNewChatOpen && users.length === 0) {
            fetchUsers();
        }
    }, [isNewChatOpen, users.length]);

    const handleStartChat = (userId: string) => {
        const conversationId = `user_${userId}`;
        setIsNewChatOpen(false);
        router.push(`/admin/chat/${conversationId}`);
    };

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Check if user already has a conversation
    const existingConversationUserIds = new Set(conversations.map((c) => c.userId));

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <AdminLayout title="Messages" subtitle="User conversations">
            <div className="p-6">
                {/* Header with New Chat Button */}
                <div className="flex items-center justify-between mb-6">
                    <div></div>
                    <button
                        onClick={() => setIsNewChatOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Chat
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-red-500">{error}</p>
                        <button
                            onClick={() => {
                                setIsLoading(true);
                                setError(null);
                                fetchConversations();
                            }}
                            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                        >
                            Retry
                        </button>
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="text-center py-12">
                        <svg
                            className="w-16 h-16 mx-auto text-gray-400 mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No messages yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Click &quot;New Chat&quot; to start a conversation with a user
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {conversations.map((conv) => (
                            <Link
                                key={conv.conversationId}
                                href={`/admin/chat/${conv.conversationId}`}
                                className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:border-primary/50 transition-all duration-200"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-bold text-primary">
                                                {conv.userName?.charAt(0).toUpperCase() || "U"}
                                            </span>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                                    {conv.userName}
                                                </h4>
                                                {conv.unreadCount > 0 && (
                                                    <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
                                                        {conv.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                {conv.userEmail}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400 flex-shrink-0">
                                        {formatTime(conv.lastMessageAt)}
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                    {conv.lastMessage}
                                </p>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* New Chat Dialog */}
            <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
                <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Start New Conversation</DialogTitle>
                    </DialogHeader>

                    {/* Search Input */}
                    <div className="relative">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* User List */}
                    <div className="flex-1 overflow-y-auto mt-4 space-y-2 min-h-[200px] max-h-[400px]">
                        {usersLoading ? (
                            <div className="flex items-center justify-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                {searchQuery ? "No users found" : "No users available"}
                            </div>
                        ) : (
                            filteredUsers.map((user) => {
                                const hasExisting = existingConversationUserIds.has(user.id);
                                return (
                                    <button
                                        key={user.id}
                                        onClick={() => handleStartChat(user.id)}
                                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <span className="text-sm font-bold text-primary">
                                                    {user.name?.charAt(0).toUpperCase() || "U"}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                            </div>
                                        </div>
                                        {hasExisting && (
                                            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                                Existing
                                            </span>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}

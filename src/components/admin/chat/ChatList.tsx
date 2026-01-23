"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import axiosInstance from "@/lib/axiosInstance";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

export default function ChatList({ className }: { className?: string }) {
   const router = useRouter();
   const pathname = usePathname();
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

   const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase()));

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
      <div className={cn("flex flex-col h-full bg-card border-r border-border", className)}>
         <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
            <div>
               <h2 className="text-xl font-bold tracking-tight text-foreground">Messages</h2>
               <p className="text-xs text-muted-foreground">{conversations.length} conversations</p>
            </div>
            <button onClick={() => setIsNewChatOpen(true)} className="p-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
               </svg>
            </button>
         </div>

         <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {isLoading ? (
               <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
               </div>
            ) : error ? (
               <div className="text-center py-8 px-4">
                  <p className="text-destructive text-sm">{error}</p>
                  <button onClick={fetchConversations} className="mt-2 text-xs text-primary underline">
                     Retry
                  </button>
               </div>
            ) : conversations.length === 0 ? (
               <div className="text-center py-8 px-4">
                  <p className="text-sm text-muted-foreground">No messages yet</p>
               </div>
            ) : (
               conversations.map((conv) => {
                  const isActive = pathname === `/admin/chat/${conv.conversationId}`;
                  return (
                     <Link key={conv.conversationId} href={`/admin/chat/${conv.conversationId}`} className={cn("block rounded-xl p-3 transition-all duration-200", isActive ? "bg-primary/10 border-primary/20 shadow-sm" : "hover:bg-muted")}>
                        <div className="flex items-start justify-between mb-1">
                           {/* <Avatar>
                              <AvatarImage src={""} />
                              <AvatarFallback>{}</AvatarFallback>
                           </Avatar> */}
                           <div className="flex items-center gap-2 min-w-0">
                              <span className="font-semibold text-foreground truncate">{conv.userName || "Unknown User"}</span>
                              {conv.unreadCount > 0 && <span className="shrink-0 w-2 h-2 rounded-full bg-primary/50" />}
                           </div>
                           <span className="text-[10px] text-muted-foreground shrink-0">{formatTime(conv.lastMessageAt)}</span>
                        </div>
                        <p className={cn("text-xs line-clamp-1 break-all", isActive ? "text-foreground" : "text-muted-foreground")}>{conv.lastMessage}</p>
                     </Link>
                  );
               })
            )}
         </div>

         {/* New Chat Dialog */}
         <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
            <DialogContent className="max-w-md max-h-[80vh] flex flex-col bg-card text-card-foreground border-border p-0 gap-0 overflow-hidden">
               <DialogHeader className="px-6 py-4 border-b border-border">
                  <DialogTitle>New Message</DialogTitle>
               </DialogHeader>

               <div className="p-4 border-b border-border bg-muted/30">
                  <div className="relative">
                     <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                     </svg>
                     <input type="text" placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto p-2">
                  {usersLoading ? (
                     <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                     </div>
                  ) : filteredUsers.length === 0 ? (
                     <div className="text-center py-8 text-muted-foreground text-sm">{searchQuery ? "No users found" : "No users available"}</div>
                  ) : (
                     <div className="space-y-1">
                        {filteredUsers.map((user) => {
                           const hasExisting = existingConversationUserIds.has(user.id);
                           return (
                              <button key={user.id} onClick={() => handleStartChat(user.id)} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left group">
                                 <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">{user.name?.charAt(0).toUpperCase() || "U"}</div>
                                 <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                       <span className="font-medium text-foreground truncate">{user.name}</span>
                                       {hasExisting && <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">Existing</span>}
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                 </div>
                              </button>
                           );
                        })}
                     </div>
                  )}
               </div>
            </DialogContent>
         </Dialog>
      </div>
   );
}

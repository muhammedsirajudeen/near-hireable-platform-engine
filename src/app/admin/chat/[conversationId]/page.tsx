"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/lib/axiosInstance";
import { ArrowLeft, ExternalLink, Send, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface ChatMessage {
   id: string;
   senderId: string;
   senderRole: "user" | "admin";
   message: string;
   read: boolean;
   createdAt: string;
}

interface UserInfo {
   id: string;
   name: string;
   email: string;
}

export default function AdminConversationPage() {
   const params = useParams();
   const router = useRouter();
   const conversationId = params.conversationId as string;

   const [messages, setMessages] = useState<ChatMessage[]>([]);
   const [user, setUser] = useState<UserInfo | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [isSending, setIsSending] = useState(false);
   const [inputValue, setInputValue] = useState("");
   const [error, setError] = useState<string | null>(null);

   const messagesEndRef = useRef<HTMLDivElement>(null);

   const fetchMessages = async () => {
      try {
         const response = await axiosInstance.get(`/admin/chat/messages/${conversationId}`);
         if (response.data.success) {
            setMessages(response.data.messages);
            setUser(response.data.user);
         }
      } catch (err) {
         console.error("Error fetching messages:", err);
         setError("Failed to load messages");
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      if (conversationId) {
         fetchMessages();

         // Poll every 10 seconds
         const intervalId = setInterval(fetchMessages, 10000);
         return () => clearInterval(intervalId);
      }
   }, [conversationId]);

   // Auto-scroll to bottom
   useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
   }, [messages]);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputValue.trim() || isSending) return;

      const message = inputValue.trim();
      setInputValue("");
      setIsSending(true);

      try {
         const response = await axiosInstance.post(`/admin/chat/messages/${conversationId}`, {
            message,
         });
         if (response.data.success) {
            setMessages((prev) => [...prev, response.data.message]);
         }
      } catch (err) {
         console.error("Error sending message:", err);
         setInputValue(message);
      } finally {
         setIsSending(false);
      }
   };

   return (
      <div className="flex flex-col h-full bg-background">
         {/* Header */}
         <div className="flex items-center gap-4 px-6 py-4 border-b border-border bg-card/50 backdrop-blur supports-backdrop-filter:bg-background/60">
            <Button variant="ghost" size="icon" onClick={() => router.push("/admin/chat")} className="shrink-0 md:hidden">
               <ArrowLeft className="w-5 h-5" />
            </Button>
            {user ? (
               <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                     <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">{user.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                     </Avatar>
                     <div>
                        <h2 className="font-semibold text-foreground leading-none">{user.name}</h2>
                        <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                     </div>
                  </div>
                  <Link href={`/admin/users/${user.id}`}>
                     <Button variant="outline" size="sm" className="gap-2 hidden sm:flex">
                        View Profile <ExternalLink className="w-4 h-4" />
                     </Button>
                     <Button variant="ghost" size="icon" className="sm:hidden">
                        <UserIcon className="w-5 h-5" />
                     </Button>
                  </Link>
               </div>
            ) : (
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                  <div className="space-y-2">
                     <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                     <div className="h-3 w-48 bg-muted rounded animate-pulse" />
                  </div>
               </div>
            )}
         </div>

         {/* Messages */}
         <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {isLoading ? (
               <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
               </div>
            ) : error ? (
               <div className="flex items-center justify-center h-full">
                  <p className="text-destructive font-medium">{error}</p>
               </div>
            ) : messages.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                     <Send className="w-8 h-8 text-muted-foreground/50 ml-1" />
                  </div>
                  <p>No messages in this conversation</p>
               </div>
            ) : (
               <>
                  {messages.map((msg) => (
                     <div key={msg.id} className={`flex ${msg.senderRole === "admin" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${msg.senderRole === "admin" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
                           <p className="whitespace-pre-wrap wrap-break-word leading-relaxed">{msg.message}</p>
                           <p className={`text-[10px] mt-1.5 ${msg.senderRole === "admin" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                     </div>
                  ))}
                  <div ref={messagesEndRef} />
               </>
            )}
         </div>

         {/* Input */}
         <div className="w-full p-4 border-t border-border bg-white backdrop-blur supports-backdrop-filter:bg-background/60">
            <form onSubmit={handleSubmit} className="flex items-end gap-3 w-full">
               <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Type a message..." className="min-h-[44px] w-full bg-background" disabled={isSending} maxLength={2000} />
               <Button type="submit" disabled={!inputValue.trim() || isSending} size="icon" className="shrink-0 h-11 w-11">
                  <Send className="w-5 h-5" />
               </Button>
            </form>
         </div>
      </div>
   );
}

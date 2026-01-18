"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import axiosInstance from "@/lib/axiosInstance";
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
   const inputRef = useRef<HTMLInputElement>(null);

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
      <AdminLayout>
         <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Header */}
            <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
               <button onClick={() => router.push("/admin/chat")} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
               </button>
               {user ? (
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{user.name?.charAt(0).toUpperCase() || "U"}</span>
                     </div>
                     <div>
                        <h2 className="font-semibold text-gray-900 dark:text-white">{user.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                     </div>
                  </div>
               ) : (
                  <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
               )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50 dark:bg-gray-900">
               {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                     <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                  </div>
               ) : error ? (
                  <div className="text-center py-12">
                     <p className="text-red-500">{error}</p>
                  </div>
               ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                     <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                     </svg>
                     <p>No messages in this conversation</p>
                  </div>
               ) : (
                  <>
                     {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.senderRole === "admin" ? "justify-end" : "justify-start"}`}>
                           <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${msg.senderRole === "admin" ? "bg-primary text-white rounded-br-md" : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-bl-md"}`}>
                              <p className="whitespace-pre-wrap wrap-break-word">{msg.message}</p>
                              <p className={`text-[10px] mt-1 ${msg.senderRole === "admin" ? "text-white/70" : "text-gray-400"}`}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                           </div>
                        </div>
                     ))}
                     <div ref={messagesEndRef} />
                  </>
               )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex items-center gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
               <input ref={inputRef} type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Type a message..." className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white" disabled={isSending} maxLength={2000} />
               <button type="submit" disabled={!inputValue.trim() || isSending} className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium">
                  {isSending ? "Sending..." : "Send"}
               </button>
            </form>
         </div>
      </AdminLayout>
   );
}

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { UserRole } from "@/types/enums/role.enum";
import { useEffect, useRef, useState } from "react";

export default function ChatDialog() {
   const { user, isAuthenticated } = useAuth();
   const { isOpen, closeChat, messages, isLoading, isSending, sendMessage } = useChat();
   const [inputValue, setInputValue] = useState("");
   const messagesEndRef = useRef<HTMLDivElement>(null);
   const inputRef = useRef<HTMLInputElement>(null);

   // Determine if chat should be shown
   const shouldShow = isAuthenticated && user && user.role !== UserRole.ADMIN;

   // Auto-scroll to bottom when new messages arrive
   useEffect(() => {
      if (shouldShow && isOpen) {
         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
   }, [messages, isOpen, shouldShow]);

   // Focus input when dialog opens
   useEffect(() => {
      if (shouldShow && isOpen) {
         inputRef.current?.focus();
      }
   }, [isOpen, shouldShow]);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputValue.trim() || isSending) return;

      const message = inputValue.trim();
      setInputValue("");

      try {
         await sendMessage(message);
      } catch {
         // Restore message on error
         setInputValue(message);
      }
   };

   // Early returns AFTER all hooks
   if (!shouldShow || !isOpen) {
      return null;
   }

   return (
      <div className="fixed bottom-6 right-6 z-50 w-[360px] h-[480px] flex flex-col bg-background border border-border rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
         {/* Header */}
         <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
               </div>
               <div>
                  <h3 className="font-semibold text-sm">Admin Support</h3>
                  <p className="text-xs opacity-80">We typically reply within 5 minutes</p>
               </div>
            </div>
            <button onClick={closeChat} className="p-1 rounded-lg hover:bg-primary-foreground/20 transition-colors" aria-label="Close chat">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
            </button>
         </div>

         {/* Messages */}
         <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
            {isLoading ? (
               <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
               </div>
            ) : messages.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs mt-1">Send a message to start the conversation</p>
               </div>
            ) : (
               <>
                  {messages.map((msg) => (
                     <div key={msg.id} className={`flex ${msg.senderRole === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${msg.senderRole === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-background border border-border text-foreground rounded-bl-md"}`}>
                           <p className="whitespace-pre-wrap wrap-break-word">{msg.message}</p>
                           <p className={`text-[10px] mt-1 ${msg.senderRole === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                     </div>
                  ))}
                  <div ref={messagesEndRef} />
               </>
            )}
         </div>

         {/* Input */}
         <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 border-t border-border bg-background">
            <input ref={inputRef} type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Type a message..." className="flex-1 px-3 py-2 text-sm bg-muted rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-primary" disabled={isSending} maxLength={2000} />
            <button type="submit" disabled={!inputValue.trim() || isSending} className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" aria-label="Send message">
               {isSending ? (
                  <div className="w-5 h-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
               ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
               )}
            </button>
         </form>
      </div>
   );
}

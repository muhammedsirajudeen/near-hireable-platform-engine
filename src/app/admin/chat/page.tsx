"use client";

import ChatList from "@/components/admin/chat/ChatList";

export default function AdminChatPage() {
   return (
      <>
         {/* Mobile: Show Chat List */}
         <div className="md:hidden h-full">
            <ChatList className="border-r-0" />
         </div>

         {/* Desktop: Show Empty State */}
         <div className="hidden md:flex h-full flex-col items-center justify-center text-center p-8 bg-muted/5">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
               <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
               </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground">Admin Chat</h2>
            <p className="text-muted-foreground mt-2 max-w-sm">Select a conversation from the sidebar to start messaging with a user.</p>
         </div>
      </>
   );
}

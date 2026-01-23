import ChatList from "@/components/admin/chat/ChatList";
import { Metadata } from "next";

export const metadata: Metadata = {
   title: "Admin Chat",
   description: "Manage user conversations",
};

export default function AdminChatLayout({ children }: { children: React.ReactNode }) {
   return (
      <div className="flex h-[calc(100vh-4rem)] bg-background">
         {/* Sidebar - Hidden on mobile, visible on desktop */}
         <div className="hidden md:block w-80 shrink-0 border-r border-border">
            <ChatList className="h-full border-r-0" />
         </div>
         {/* Main Content */}
         <div className="flex-1 min-w-0 bg-background">{children}</div>
      </div>
   );
}

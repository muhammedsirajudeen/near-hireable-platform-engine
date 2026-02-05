"use client";

import ChatList from "@/components/admin/chat/ChatList";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function ChatLayoutClient({ children }: { children: React.ReactNode }) {
   const pathname = usePathname();
   const isRoot = pathname === "/admin/chat";

   return (
      <div className="flex h-[calc(100vh-4rem)] bg-background">
         {/* Sidebar */}
         <div className={cn("md:block md:w-80 md:shrink-0 md:border-r md:border-border", isRoot ? "block w-full" : "hidden")}>
            <ChatList className="h-full border-r-0" />
         </div>

         {/* Main Content */}
         <div className={cn("md:block flex-1 min-w-0 bg-background", isRoot ? "hidden" : "block h-full")}>{children}</div>
      </div>
   );
}

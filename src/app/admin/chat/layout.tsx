import ChatLayoutClient from "@/components/admin/chat/ChatLayoutClient";
import { Metadata } from "next";

export const metadata: Metadata = {
   title: "Near Hireable Engine",
   description: "Most developers are unemployable because they don't know where they stand. We fix that.",
};

export default function AdminChatLayout({ children }: { children: React.ReactNode }) {
   return <ChatLayoutClient>{children}</ChatLayoutClient>;
}

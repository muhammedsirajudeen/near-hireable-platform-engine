import FloatingChatWidget from "@/components/chat/FloatingChatWidget";
import InitSW from "@/components/webpush/InitSw";
import PushAutoCheck from "@/components/webpush/PushAutoCheck";
import { AuthProvider } from "@/contexts/AuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
   weight: ["300", "400", "500", "600", "700"],
   subsets: ["latin"],
   variable: "--font-poppins",
});

export const metadata: Metadata = {
   title: "Near Hireable Engine",
   description: "Most developers are unemployable because they don't know where they stand. We fix that.",
};

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang="en" className="dark" suppressHydrationWarning>
         <body className={`${poppins.variable} antialiased`}>
            <InitSW />
            <AuthProvider>
               <PushAutoCheck />
               <ChatProvider>
                  {children}
                  <FloatingChatWidget />
               </ChatProvider>
            </AuthProvider>
         </body>
      </html>
   );
}

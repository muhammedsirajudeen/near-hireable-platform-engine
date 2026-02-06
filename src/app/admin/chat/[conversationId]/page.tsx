"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/lib/axiosInstance";
import { formatMessageTime } from "@/utils/messageDateFormatter";
import { ArrowLeft, ExternalLink, MessageSquarePlus, Send, User as UserIcon } from "lucide-react";
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

const TEMPLATES = [
   {
      label: "Any Update",
      text: "Hey, please share an update when you get a chance.",
   },
   {
      label: "Gentle Reminder",
      text: "This is a quick reminder regarding the pending review.",
   },
   {
      label: "Apology for Delay",
      text: "Sorry for the delay in getting back to you.",
   },
   {
      label: "Review Taking Time",
      text: "The review is taking a bit longer than expected. Thanks for your patience.",
   },
   {
      label: "Schedule Review",
      text: "Please share your preferred time so we can schedule the review.",
   },
   {
      label: "Confirm Schedule",
      text: "Just confirming the scheduled review time.",
   },
   {
      label: "Reschedule Request",
      text: "Could you please reschedule and share another convenient time?",
   },
   {
      label: "Reviewer Unavailable",
      text: "The reviewer is unavailable at the scheduled time. Please suggest another slot.",
   },
   {
      label: "Next Module Unlocked",
      text: "The next module is now unlocked. You can start working on the assigned tasks.",
   },
   {
      label: "Tasks Assigned",
      text: "New tasks have been added to your module.",
   },
   {
      label: "Pending Tasks",
      text: "You still have a few pending tasks to complete.",
   },
   {
      label: "Review In Progress",
      text: "Your project is currently under review.",
   },
   {
      label: "Changes Required",
      text: "A few changes are required. Please check the review comments.",
   },
   {
      label: "Re-review Started",
      text: "Your updated submission is under review again.",
   },
   {
      label: "Project Approved",
      text: "Your project has been approved. Nice work!",
   },
   {
      label: "No Activity Yet",
      text: "We haven’t seen any recent activity yet.",
   },
   {
      label: "Inactive Reminder",
      text: "We noticed a pause in activity. Resume whenever you’re ready.",
   },
   {
      label: "Good Progress",
      text: "You’re making good progress so far.",
   },
   {
      label: "No Rush",
      text: "There’s no rush. Let us know when you’re ready for the review.",
   },
   {
      label: "Submission Received",
      text: "We’ve received your submission and will review it shortly.",
   },
   {
      label: "Resubmission Received",
      text: "Your updated submission has been received.",
   },

   {
      label: "Need Help",
      text: "Let us know if you need any help with this.",
   },
   {
      label: "Anything Else",
      text: "Let us know if there’s anything else you need.",
   },
];

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

   // Auto-focus on typing
   useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
         // Ignore if holding modifier keys (ctrl, alt, meta)
         if (e.ctrlKey || e.altKey || e.metaKey) return;

         // Ignore if focus is already on an input or textarea
         if (document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement || (document.activeElement as HTMLElement).isContentEditable) {
            return;
         }

         // Focus input on any printable character key
         if (e.key.length === 1) {
            inputRef.current?.focus();
         }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
   }, []);

   const handleSubmit = async (e: React.FormEvent | React.KeyboardEvent) => {
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
            setMessages((prev) => {
               if (prev.some((m) => m.id === response.data.message.id)) return prev;
               return [...prev, response.data.message];
            });
         }
      } catch (err) {
         console.error("Error sending message:", err);
         setInputValue(message);
      } finally {
         setIsSending(false);
         // Keep focus after sending
         setTimeout(() => inputRef.current?.focus(), 0);
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
                           <p className={`text-[10px] mt-1.5 ${msg.senderRole === "admin" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{formatMessageTime(msg.createdAt)}</p>
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
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant="outline" size="icon" className="shrink-0 h-11 w-11" type="button">
                        <MessageSquarePlus className="w-5 h-5 text-muted-foreground" />
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[300px]">
                     {TEMPLATES.map((template, index) => (
                        <DropdownMenuItem key={index} onClick={() => setInputValue(template.text)} className="cursor-pointer flex flex-col items-start p-3 gap-1">
                           <span className="font-medium text-sm text-foreground">{template.label}</span>
                           <span className="text-xs text-muted-foreground line-clamp-1">{template.text}</span>
                        </DropdownMenuItem>
                     ))}
                  </DropdownMenuContent>
               </DropdownMenu>
               <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                     if (e.key === "End") {
                        e.preventDefault();
                        handleSubmit(e);
                     }
                  }}
                  placeholder="Type a message..."
                  className="min-h-[44px] w-full bg-background"
                  disabled={isSending}
                  maxLength={2000}
               />
               <Button type="submit" disabled={!inputValue.trim() || isSending} size="icon" className="shrink-0 h-11 w-11">
                  <Send className="w-5 h-5" />
               </Button>
            </form>
         </div>
      </div>
   );
}

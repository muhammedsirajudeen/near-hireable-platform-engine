"use client";

import { Command, FileText, LayoutDashboard, MessageSquare, Users } from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useAdmin } from "@/contexts/AdminContext";
import { usePathname } from "next/navigation";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
   const { unreadCount } = useAdmin();
   const pathname = usePathname();

   const navMain = [
      {
         title: "Dashboard",
         url: "/admin/dashboard",
         icon: LayoutDashboard,
         isActive: pathname === "/admin/dashboard",
      },
      {
         title: "PRD Management",
         url: "/admin/prds",
         icon: FileText,
         isActive: pathname.startsWith("/admin/prds"),
      },
      {
         title: "Messages",
         url: "/admin/chat",
         icon: MessageSquare,
         badge: unreadCount,
         isActive: pathname.startsWith("/admin/chat"),
      },
      {
         title: "User Management",
         url: "/admin/users",
         icon: Users,
         isActive: pathname.startsWith("/admin/users"),
      },
   ];

   return (
      <Sidebar collapsible="icon" {...props}>
         <SidebarHeader>
            <SidebarMenu>
               <SidebarMenuItem>
                  <SidebarMenuButton size="lg" asChild>
                     <a href="/admin/dashboard">
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                           <Command className="size-4" />
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                           <span className="truncate font-semibold">Admin Panel</span>
                           <span className="truncate text-xs">Intake Portal</span>
                        </div>
                     </a>
                  </SidebarMenuButton>
               </SidebarMenuItem>
            </SidebarMenu>
         </SidebarHeader>
         <SidebarContent>
            <NavMain items={navMain} />
         </SidebarContent>
         <SidebarFooter>
            <NavUser />
         </SidebarFooter>
      </Sidebar>
   );
}

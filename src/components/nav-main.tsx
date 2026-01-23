"use client";

import { type LucideIcon } from "lucide-react";

import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

export function NavMain({
   items,
}: {
   items: {
      title: string;
      url: string;
      icon?: LucideIcon;
      badge?: number; // Add badge support
      isActive?: boolean;
   }[];
}) {
   return (
      <SidebarGroup>
         <SidebarGroupContent>
            <SidebarMenu>
               {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                     <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive}>
                        <a href={item.url}>
                           {item.icon && <item.icon />}
                           <span>{item.title}</span>
                           {/* Badge Display */}
                           {item.badge !== undefined && item.badge > 0 && <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-medium text-destructive-foreground">{item.badge}</span>}
                        </a>
                     </SidebarMenuButton>
                  </SidebarMenuItem>
               ))}
            </SidebarMenu>
         </SidebarGroupContent>
      </SidebarGroup>
   );
}

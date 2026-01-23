"use client";

import { ChevronsUpDown, LogOut } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import onboardLogo from "~/public/onboard.png";

export function NavUser() {
   const { isMobile } = useSidebar();
   const { user, logout } = useAuth();
   const router = useRouter();

   const handleLogout = async () => {
      await logout();
      router.push("/admin/login");
   };

   if (!user) return null;

   return (
      <SidebarMenu>
         <SidebarMenuItem>
            <DropdownMenu>
               <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                     <Avatar className="h-8 w-8 rounded-lg bg-white">
                        <Image src={onboardLogo} alt="Onboard Logo" />
                        <AvatarFallback className="rounded-lg">{user.name?.charAt(0).toUpperCase() || "A"}</AvatarFallback>
                     </Avatar>
                     <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{user.name || "Admin"}</span>
                        <span className="truncate text-xs">{user.email}</span>
                     </div>
                     <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
               </DropdownMenuTrigger>
               <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" side={isMobile ? "bottom" : "right"} align="end" sideOffset={4}>
                  <DropdownMenuLabel className="p-0 font-normal">
                     <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="h-8 w-8 rounded-lg bg-white">
                           <Image src={onboardLogo} alt="Onboard Logo" />
                           <AvatarFallback className="rounded-lg">{user.name?.charAt(0).toUpperCase() || "A"}</AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                           <span className="truncate font-semibold">{user.name || "Admin"}</span>
                           <span className="truncate text-xs">{user.email}</span>
                        </div>
                     </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                     {/* <DropdownMenuItem>
                        <BadgeCheck className="mr-2 h-4 w-4" />
                        Account
                     </DropdownMenuItem>
                     <DropdownMenuItem>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Billing
                     </DropdownMenuItem>
                     <DropdownMenuItem>
                        <Bell className="mr-2 h-4 w-4" />
                        Notifications
                     </DropdownMenuItem> */}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                     <LogOut className="mr-2 h-4 w-4" />
                     Log out
                  </DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
         </SidebarMenuItem>
      </SidebarMenu>
   );
}

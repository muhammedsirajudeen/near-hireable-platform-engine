"use client";

import axiosInstance from "@/lib/axiosInstance";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AdminContextType {
   sidebarCollapsed: boolean;
   unreadCount: number;
   toggleSidebar: () => void;
   setSidebarCollapsed: (collapsed: boolean) => void;
   refreshUnreadCount: () => Promise<void>;
   isMobile: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
   // Default to true (collapsed/mini) to avoid hydration mismatch, update in effect
   const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
   const [isMobile, setIsMobile] = useState(false);
   const [unreadCount, setUnreadCount] = useState(0);

   const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

   const refreshUnreadCount = async () => {
      try {
         const response = await axiosInstance.get("/admin/chat/conversations");
         if (response.data.success) {
            const total = response.data.conversations.reduce((sum: number, conv: { unreadCount: number }) => sum + conv.unreadCount, 0);
            setUnreadCount(total);
         }
      } catch (error) {
         console.error("Error fetching unread count:", error);
      }
   };

   // Poll for unread messages
   useEffect(() => {
      refreshUnreadCount();
      const intervalId = setInterval(refreshUnreadCount, 10000);
      return () => clearInterval(intervalId);
   }, []);

   // Handle initial responsive state
   useEffect(() => {
      const handleResize = () => {
         const mobile = window.innerWidth < 1024;
         // Only update if changed
         setIsMobile((prev) => {
            if (prev !== mobile) {
               return mobile;
            }
            return prev;
         });
      };

      // Set initial state
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setSidebarCollapsed(mobile); // Start collapsed on mobile, expanded on desktop by default?
      // Actually, if it's desktop, we want it expanded (false). If mobile, collapsed (true).

      // Wait, if I refresh as Desktop, I want it Open (false).
      // If I refresh as Mobile, I want it Mini (true).
      if (!mobile) {
         setSidebarCollapsed(false);
      }

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
   }, []);

   return (
      <AdminContext.Provider
         value={{
            sidebarCollapsed,
            unreadCount,
            toggleSidebar,
            setSidebarCollapsed,
            refreshUnreadCount,
            isMobile,
         }}
      >
         {children}
      </AdminContext.Provider>
   );
}

export function useAdmin() {
   const context = useContext(AdminContext);
   if (context === undefined) {
      throw new Error("useAdmin must be used within an AdminProvider");
   }
   return context;
}

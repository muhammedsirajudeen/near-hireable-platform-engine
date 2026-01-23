"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { AdminProvider, useAdmin } from "@/contexts/AdminContext";
import AdminSidebar from "./AdminSidebar";

interface AdminLayoutProps {
   children: React.ReactNode;
   title?: string;
   subtitle?: string;
}

function AdminLayoutContent({ children, title, subtitle }: AdminLayoutProps) {
   const { sidebarCollapsed, setSidebarCollapsed, isMobile } = useAdmin();

   // Calculate content margin based on state
   // Default (Mobile or Desktop Collapsed): ml-16
   // Desktop Expanded: ml-64
   // Mobile Expanded: ml-16 (Sidebar overlaps)
   const contentMarginClass = !isMobile && !sidebarCollapsed ? "ml-64" : "ml-16";

   return (
      <div className="min-h-screen bg-background flex flex-col">
         {/* Mobile Backdrop (Only visible when Mobile + Expanded) */}
         {isMobile && !sidebarCollapsed && <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={() => setSidebarCollapsed(true)} />}

         {/* Sidebar (Fixed position handled inside component) */}
         <AdminSidebar />

         {/* Main content wrapper */}
         <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${contentMarginClass}`}>
            {/* Header */}
            {(title || subtitle) && (
               <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                     <div>
                        {title && <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>}
                        {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>}
                     </div>
                  </div>
               </div>
            )}

            {/* Page content */}
            <div className="flex-1 overflow-auto p-0">{children}</div>
         </div>
      </div>
   );
}

export default function AdminLayout(props: AdminLayoutProps) {
   return (
      <ProtectedRoute requireAdmin>
         <AdminProvider>
            <AdminLayoutContent {...props} />
         </AdminProvider>
      </ProtectedRoute>
   );
}

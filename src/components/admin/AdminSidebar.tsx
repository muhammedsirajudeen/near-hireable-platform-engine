"use client";

import { useAdmin } from "@/contexts/AdminContext";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminSidebar() {
   const pathname = usePathname();
   const router = useRouter();
   const { user, logout } = useAuth();
   const { sidebarCollapsed, setSidebarCollapsed, unreadCount, isMobile, toggleSidebar } = useAdmin();

   const handleLogout = async () => {
      await logout();
      router.push("/admin/login");
   };

   const navItems = [
      {
         name: "Dashboard",
         href: "/admin/dashboard",
         icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
         ),
      },
      {
         name: "PRD Management",
         href: "/admin/prds",
         icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
         ),
      },
      {
         name: "Messages",
         href: "/admin/chat",
         badge: unreadCount,
         icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
         ),
      },
      {
         name: "User Management",
         href: "/admin/users",
         icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
         ),
      },
   ];

   // Responsive Logic:
   // Sidebar always fixed to ensure it stays in place.
   const sidebarClasses = `
      fixed inset-y-0 left-0 z-50
      bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
      flex flex-col transition-all duration-300
      ${sidebarCollapsed ? "w-16" : "w-64"}
   `;

   return (
      <aside className={sidebarClasses}>
         {/* Logo/Header */}
         <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 overflow-hidden">
               <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
               </div>
               <span className={`text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap transition-opacity duration-300 ${sidebarCollapsed ? "opacity-0 w-0" : "opacity-100"}`}>Admin Panel</span>
            </div>

            {/* Toggle Button: Always visible if Expanded OR if Desktop */}
            {(!sidebarCollapsed || !isMobile) && (
               <button onClick={toggleSidebar} className={`p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 ${sidebarCollapsed ? "hidden group-hover:block" : ""}`}>
                  {sidebarCollapsed ? (
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                     </svg>
                  ) : (
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                     </svg>
                  )}
               </button>
            )}
         </div>

         {/* Navigation */}
         <nav className="flex-1 p-2 space-y-2 overflow-y-auto overflow-x-hidden">
            {navItems.map((item) => {
               const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
               return (
                  <Link
                     key={item.href}
                     href={item.href}
                     onClick={() => isMobile && setSidebarCollapsed(true)} // Auto-collapse on mobile nav
                     className={`relative group flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive ? "bg-primary text-white shadow-md" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                     title={sidebarCollapsed ? item.name : ""}
                  >
                     <span className="shrink-0 flex justify-center w-6">{item.icon}</span>

                     <span className={`ml-3 font-medium whitespace-nowrap transition-opacity duration-200 ${sidebarCollapsed ? "opacity-0 w-0 hidden" : "opacity-100"}`}>{item.name}</span>

                     {/* Badge */}
                     {item.badge !== undefined && item.badge > 0 && (
                        <>
                           {/* Expanded Badge */}
                           {!sidebarCollapsed && <span className="ml-auto inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-bold rounded-full bg-red-500 text-white">{item.badge > 99 ? "99+" : item.badge}</span>}

                           {/* Collapsed Dot */}
                           {sidebarCollapsed && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-gray-800 rounded-full"></span>}
                        </>
                     )}

                     {/* Hover Tooltip for Collapsed Mode (Desktop) */}
                     {sidebarCollapsed && !isMobile && <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50">{item.name}</div>}
                  </Link>
               );
            })}

            {/* Toggle Button for Mobile Collapsed State: Bottom Center */}
            {sidebarCollapsed && (
               <div className="mt-auto pt-4 flex justify-center pb-2">
                  <button onClick={toggleSidebar} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                     <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                     </svg>
                  </button>
               </div>
            )}
         </nav>

         {/* User section */}
         <div className={`p-4 border-t border-gray-200 dark:border-gray-700 ${sidebarCollapsed ? "flex justify-center" : ""}`}>
            <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "space-x-3"} mb-3`}>
               <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-300">{user?.name?.charAt(0).toUpperCase() || "A"}</span>
               </div>
               {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                     <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name || "Admin"}</p>
                  </div>
               )}
            </div>
            <button onClick={handleLogout} className={`w-full flex items-center justify-center space-x-2 px-2 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors group relative`} title="Logout">
               <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
               </svg>
               {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
            </button>
         </div>
      </aside>
   );
}

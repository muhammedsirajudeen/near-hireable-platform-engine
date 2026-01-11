"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import AdminSidebar from "./AdminSidebar";
import { useState } from "react";

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

export default function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <ProtectedRoute requireAdmin>
            <div className="min-h-screen bg-background flex">
                {/* Sidebar */}
                <AdminSidebar
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                />

                {/* Main content */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Header */}
                    {(title || subtitle) && (
                        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    {title && (
                                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {title}
                                        </h1>
                                    )}
                                    {subtitle && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {subtitle}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors lg:hidden"
                                >
                                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Page content */}
                    <div className="flex-1 overflow-auto">
                        {children}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

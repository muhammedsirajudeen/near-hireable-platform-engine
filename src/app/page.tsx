"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function HomePage() {
   const { user, logout } = useAuth();
   const router = useRouter();

   const handleLogout = async () => {
      await logout();
      router.push("/signin");
   };

   return (
      <ProtectedRoute>
         <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                  <div className="flex items-center justify-between">
                     <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Intake Portal</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Welcome, {user?.name}</p>
                     </div>
                     <button onClick={handleLogout} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200">
                        Logout
                     </button>
                  </div>
               </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
               {/* Welcome Section */}
               <div className="text-center mb-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-purple-500 to-blue-600 mb-6">
                     <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                     </svg>
                  </div>
                  <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Welcome to Intake Portal</h2>
                  <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">You're successfully logged in! This is your home page.</p>
               </div>

               {/* User Info Card */}
               <div className="max-w-2xl mx-auto">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
                     <div className="flex items-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-linear-to-br from-purple-500 to-blue-600 flex items-center justify-center mr-4">
                           <span className="text-2xl font-bold text-white">{user?.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                           <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h3>
                           <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                        </div>
                     </div>

                     <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Role</p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{user?.role}</p>
                           </div>
                           <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                              <div className="flex items-center">
                                 <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                 <p className="text-lg font-semibold text-gray-900 dark:text-white">Active</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Quick Actions */}
               <div className="max-w-4xl mx-auto mt-12">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {user?.role === "admin" && (
                        <button onClick={() => router.push("/admin/dashboard")} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                           <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4 mx-auto">
                              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                 />
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                           </div>
                           <h4 className="text-lg font-semibold text-gray-900 dark:text-white text-center">Admin Dashboard</h4>
                           <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">Manage authorized emails</p>
                        </button>
                     )}

                     <button className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 mx-auto">
                           <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                           </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white text-center">Profile</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">View and edit your profile</p>
                     </button>

                     <button className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 mx-auto">
                           <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                           </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white text-center">Documents</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">Access your documents</p>
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </ProtectedRoute>
   );
}

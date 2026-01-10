"use client";

import PublicRoute from "@/components/PublicRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
   const [password, setPassword] = useState("");
   const [error, setError] = useState("");
   const [loading, setLoading] = useState(false);
   const { adminLogin } = useAuth();
   const router = useRouter();

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
         await adminLogin(password);
         router.push("/admin/dashboard");
      } catch (err: unknown) {
         setError(err instanceof Error && "response" in err ? (err as Error & { response?: { data?: { error?: string } } }).response?.data?.error || "Invalid password" : "Invalid password");
      } finally {
         setLoading(false);
      }
   };

   return (
      <PublicRoute>
         <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
            <div className="max-w-md w-full">
               {/* Card */}
               <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
                  {/* Header */}
                  <div className="text-center mb-8">
                     <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-br from-purple-500 to-blue-600 mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                     </div>
                     <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Access</h1>
                     <p className="text-gray-600 dark:text-gray-400">Enter your admin password to continue</p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                     {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                           <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                     )}

                     <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                           Password
                        </label>
                        <input
                           type="password"
                           id="password"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                           placeholder="Enter admin password"
                           required
                        />
                     </div>

                     <button type="submit" disabled={loading} className="w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                        {loading ? (
                           <span className="flex items-center justify-center">
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Signing in...
                           </span>
                        ) : (
                           "Sign In"
                        )}
                     </button>
                  </form>
               </div>
            </div>
         </div>
      </PublicRoute>
   );
}

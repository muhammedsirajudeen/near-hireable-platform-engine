"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
   children: React.ReactNode;
   requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
   const { user, loading, isAuthenticated } = useAuth();
   const router = useRouter();

   useEffect(() => {
      if (!loading) {
         if (!isAuthenticated) {
            router.push("/signin");
         } else if (requireAdmin && user?.role !== "admin") {
            router.push("/");
         }
      }
   }, [loading, isAuthenticated, user, requireAdmin, router]);

   if (loading) {
      return (
         <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
         </div>
      );
   }

   if (!isAuthenticated || (requireAdmin && user?.role !== "admin")) {
      return null;
   }

   return <>{children}</>;
}

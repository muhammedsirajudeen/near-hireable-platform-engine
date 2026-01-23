"use client";

import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
   children: React.ReactNode;
   requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
   const { user, loading, isAuthenticated } = useAuth();
   const router = useRouter();
   const pathname = usePathname();

   console.log(`👉 role : `, user);

   useEffect(() => {
      if (!loading) {
         if (!isAuthenticated) {
            if (pathname.startsWith("/admin")) {
               router.push("/admin/login");
            } else {
               router.push("/signin");
            }
         } else if (requireAdmin && user?.role !== "admin") {
            router.push("/");
         }
      }
   }, [loading, isAuthenticated, user, requireAdmin, router]);

   if (loading) {
      return (
         <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
         </div>
      );
   }

   if (!isAuthenticated || (requireAdmin && user?.role !== "admin")) {
      return null;
   }

   return <>{children}</>;
}

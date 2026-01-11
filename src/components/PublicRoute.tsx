"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface PublicRouteProps {
   children: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
   const { isAuthenticated, loading, user } = useAuth();
   const router = useRouter();

   useEffect(() => {
      if (!loading && isAuthenticated) {
         // Redirect authenticated users based on their role
         if (user?.role === "admin") {
            router.push("/admin/dashboard");
         } else {
            router.push("/");
         }
      }
   }, [loading, isAuthenticated, user, router]);

   if (loading) {
      return (
         <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
         </div>
      );
   }

   // If authenticated, don't show the page (will redirect)
   if (isAuthenticated) {
      return null;
   }

   return <>{children}</>;
}

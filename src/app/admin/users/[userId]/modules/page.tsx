"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import axiosInstance from "@/lib/axiosInstance";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Module {
   moduleId: number;
   status: "locked" | "unlocked" | "completed";
}

export default function AdminUserModulesPage() {
   const params = useParams();
   const userId = params.userId;
   const [modules, setModules] = useState<Module[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      if (userId) fetchModules();
   }, [userId]);

   const fetchModules = async () => {
      try {
         const response = await axiosInstance.get(`/admin/users/${userId}/modules`);
         setModules(response.data);
      } catch (error) {
         console.error("Failed to fetch modules", error);
      } finally {
         setLoading(false);
      }
   };

   if (loading) {
      return (
         <div className="flex justify-center items-center h-screen bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
         </div>
      );
   }

   return (
      <ProtectedRoute requireAdmin={true}>
         <div className="min-h-screen bg-background text-foreground">
            <div className="max-w-7xl mx-auto px-4 py-8">
               <div className="flex items-center gap-4 mb-8">
                  <Link href="/admin/users" className="text-muted-foreground hover:text-foreground">
                     <ArrowLeft />
                  </Link>
                  <h1 className="text-3xl font-bold">User Modules</h1>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {modules.map((module) => (
                     <Link href={`/admin/users/${userId}/modules/${module.moduleId}`} key={module.moduleId} className="block group">
                        <div className={`p-6 rounded-xl border-2 transition-all duration-200 h-full flex flex-col items-center justify-center text-center gap-3 ${module.status === "locked" ? "border-muted bg-muted/10 opacity-60" : "border-primary bg-card hover:shadow-md hover:scale-[1.02]"}`}>
                           <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${module.status === "locked" ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"}`}>{module.moduleId}</div>
                           <span className={`font-medium ${module.status === "locked" ? "text-muted-foreground" : "text-foreground"}`}>Module {module.moduleId}</span>
                           <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${module.status === "locked" ? "bg-muted text-muted-foreground" : module.status === "completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{module.status}</span>
                        </div>
                     </Link>
                  ))}
               </div>
            </div>
         </div>
      </ProtectedRoute>
   );
}

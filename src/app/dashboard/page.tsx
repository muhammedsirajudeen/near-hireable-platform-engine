"use client";

import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import axiosInstance from "@/lib/axiosInstance";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Module {
   moduleId: number;
   status: "locked" | "unlocked" | "completed";
}

interface UserModule {
   userId: string;
   modules: Module[];
}

export default function DashboardPage() {
   const [userModules, setUserModules] = useState<UserModule | null>(null);
   const [loading, setLoading] = useState(true);
   const [showLockedAlert, setShowLockedAlert] = useState(false);
   const [selectedLockedModule, setSelectedLockedModule] = useState<number | null>(null);
   const isDesktop = useMediaQuery("(min-width: 768px)");

   useEffect(() => {
      const fetchModules = async () => {
         try {
            const response = await axiosInstance.get("/user/modules");
            if (response.data.success) {
               setUserModules(response.data.data);
            }
         } catch (error) {
            console.error("Failed to fetch modules", error);
         } finally {
            setLoading(false);
         }
      };

      fetchModules();
   }, []);

   const isVtReviewModule = (moduleId: number) => {
      return [7, 14, 21, 28].includes(moduleId);
   };

   const handleModuleClick = (e: React.MouseEvent, module: Module) => {
      if (module.status === "locked") {
         e.preventDefault();
         setSelectedLockedModule(module.moduleId);
         setShowLockedAlert(true);
      }
   };

   return (
      <ProtectedRoute>
         <div className="min-h-screen bg-background">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24 md:pb-12">
               <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-foreground mb-4">Your Learning Journey</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">Complete the modules to unlock new opportunities.</p>
               </div>

               {loading ? (
                  <div className="flex justify-center items-center h-64">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
               ) : !userModules ? (
                  <div className="text-center py-12">
                     <p className="text-muted-foreground">No modules found. Please ensure your PRD is approved.</p>
                  </div>
               ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                     {userModules.modules.map((module) => (
                        <Link href={`/dashboard/modules/${module.moduleId}`} key={module.moduleId} className="block group" onClick={(e) => handleModuleClick(e, module)}>
                           <div
                              className={`relative p-6 rounded-xl border-2 transition-all duration-300 h-full ${
                                 module.status === "locked"
                                    ? "border-muted bg-muted/20 opacity-70 cursor-pointer" // Removed pointer-events-none
                                    : module.status === "completed"
                                      ? "border-green-500 bg-green-50/50 dark:bg-green-900/10 shadow-sm hover:shadow-md cursor-pointer"
                                      : "border-primary bg-card shadow-lg hover:shadow-xl hover:scale-[1.02] cursor-pointer"
                              }`}
                           >
                              <div className="flex justify-between items-start mb-4">
                                 <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${module.status === "locked" ? "bg-muted text-muted-foreground" : module.status === "completed" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-primary text-primary-foreground"}`}>
                                    {module.moduleId}
                                 </div>
                                 {module.status === "locked" && (
                                    <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                 )}
                                 {module.status === "unlocked" && (
                                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                    </svg>
                                 )}
                                 {module.status === "completed" && (
                                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                 )}
                              </div>

                              <h3 className={`font-semibold mb-2 ${module.status === "locked" ? "text-muted-foreground" : "text-foreground"}`}>Module {module.moduleId}</h3>

                              <p className="text-sm text-muted-foreground mb-4">{module.status === "locked" ? "Complete previous module to unlock" : module.status === "completed" ? "Completed" : "Ready to start"}</p>

                              {module.status === "unlocked" && <span className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors block text-center">Open Module</span>}
                              {module.status === "completed" && <span className="w-full py-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg font-medium text-sm transition-colors block text-center">Review Module</span>}

                              {isVtReviewModule(module.moduleId) && (
                                 <div className="absolute -top-3 -right-3">
                                    <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full border border-yellow-200 shadow-sm flex items-center">
                                       <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1 animate-pulse"></span>
                                       VT Review
                                    </span>
                                 </div>
                              )}
                           </div>
                        </Link>
                     ))}
                  </div>
               )}

               {/* Responsive Locked Module Feedback */}
               {isDesktop ? (
                  <Dialog open={showLockedAlert} onOpenChange={setShowLockedAlert}>
                     <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                           <DialogTitle className="flex items-center gap-2 text-destructive">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              Module Locked
                           </DialogTitle>
                           <DialogDescription className="pt-2">
                              You cannot access <strong>Module {selectedLockedModule}</strong> yet. Please complete the previous modules or wait for your Value Tutor to unlock it.
                           </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end">
                           <Button onClick={() => setShowLockedAlert(false)} variant="secondary">
                              Understood
                           </Button>
                        </div>
                     </DialogContent>
                  </Dialog>
               ) : (
                  <Drawer open={showLockedAlert} onOpenChange={setShowLockedAlert}>
                     <DrawerContent>
                        <DrawerHeader className="text-left">
                           <DrawerTitle className="flex items-center gap-2 text-destructive">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              Module Locked
                           </DrawerTitle>
                           <DrawerDescription className="pt-2">
                              You cannot access <strong>Module {selectedLockedModule}</strong> yet. Please complete the previous modules or wait for your Value Tutor to unlock it.
                           </DrawerDescription>
                        </DrawerHeader>
                        <DrawerFooter className="pt-2">
                           <DrawerClose asChild>
                              <Button variant="outline">Close</Button>
                           </DrawerClose>
                        </DrawerFooter>
                     </DrawerContent>
                  </Drawer>
               )}
            </div>
         </div>
      </ProtectedRoute>
   );
}

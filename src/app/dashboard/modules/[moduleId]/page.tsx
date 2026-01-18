"use client";

import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import axiosInstance from "@/lib/axiosInstance";
import { ModuleStatus } from "@/models/UserModule";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Re-defining client-side interfaces to avoid direct model import issues if any
interface ClientTask {
   _id: string;
   content: string;
   status: "pending" | "approved" | "rejected";
   adminComment?: string;
   createdAt: string;
}

interface ClientStandup {
   _id: string;
   date: string;
   attended: boolean;
   status: "complete" | "incomplete";
   review?: string;
   createdAt: string;
}

interface ClientModule {
   moduleId: number;
   status: ModuleStatus;
   tasks: ClientTask[];
   standups: ClientStandup[];
}

export default function ModuleDetailPage() {
   const params = useParams();
   const router = useRouter();
   const moduleId = params.moduleId;
   const [moduleData, setModuleData] = useState<ClientModule | null>(null);
   const [loading, setLoading] = useState(true);
   const [newTaskContent, setNewTaskContent] = useState("");
   const [submitting, setSubmitting] = useState(false);

   useEffect(() => {
      if (!moduleId) return;
      fetchModuleData();
   }, [moduleId]);

   const fetchModuleData = async () => {
      try {
         const response = await axiosInstance.get(`/user/modules/${moduleId}`);
         setModuleData(response.data);
      } catch (error) {
         console.error("Failed to fetch module details", error);
      } finally {
         setLoading(false);
      }
   };

   const handleAddTask = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTaskContent.trim()) return;

      setSubmitting(true);
      try {
         const response = await axiosInstance.post(`/user/modules/${moduleId}`, {
            content: newTaskContent,
         });
         setModuleData((prev) => {
            if (!prev) return null;
            return {
               ...prev,
               tasks: [...prev.tasks, response.data.task],
            };
         });
         setNewTaskContent("");
      } catch (error) {
         console.error("Failed to add task", error);
      } finally {
         setSubmitting(false);
      }
   };

   if (loading) {
      return (
         <div className="flex justify-center items-center h-screen bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
         </div>
      );
   }

   if (!moduleData) {
      return (
         <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
            <p className="text-xl">Module not found.</p>
            <button onClick={() => router.push("/dashboard")} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
               Back to Dashboard
            </button>
         </div>
      );
   }

   return (
      <ProtectedRoute>
         <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 py-8">
               <div className="mb-8 flex justify-between items-center">
                  <h1 className="text-3xl font-bold">Module {moduleData.moduleId}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${moduleData.status === "locked" ? "bg-red-100 text-red-800" : moduleData.status === "completed" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>{moduleData.status.toUpperCase()}</span>
               </div>

               {/* Stand-up Review Section */}
               <div className="bg-card border border-border rounded-xl shadow-sm p-6 mb-8">
                  <h2 className="text-xl font-bold mb-4 flex items-center">
                     <span className="w-2 h-6 bg-primary rounded-full mr-3"></span>
                     Stand-up Review
                  </h2>
                  {moduleData.standups && moduleData.standups.length > 0 ? (
                     <div className="space-y-4">
                        {moduleData.standups.map((standup, idx) => (
                           <div key={standup._id || idx} className="border-b border-border last:border-0 pb-4 last:pb-0">
                              <div className="flex justify-between items-start mb-2">
                                 <span className="text-muted-foreground text-sm font-medium">{new Date(standup.date).toLocaleDateString()}</span>
                                 <span className={`text-xs px-2 py-0.5 rounded ${standup.attended ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{standup.attended ? "Attended" : "Missed"}</span>
                              </div>
                              <p className="text-foreground">{standup.review || "No review added."}</p>
                              <div className="mt-2 text-xs flex items-center gap-2">
                                 <span className="font-semibold text-muted-foreground">Status:</span>
                                 <span className={standup.status === "complete" ? "text-green-600" : "text-yellow-600"}>{standup.status.toUpperCase()}</span>
                              </div>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <p className="text-muted-foreground text-center py-4 bg-muted/20 rounded-lg">No stand-up reviews yet.</p>
                  )}
               </div>

               {/* Tasks Section */}
               <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center">
                     <span className="w-2 h-6 bg-secondary rounded-full mr-3"></span>
                     Module Tasks
                  </h2>

                  <div className="space-y-4 mb-8">
                     {moduleData.tasks && moduleData.tasks.length > 0 ? (
                        moduleData.tasks.map((task, idx) => (
                           <div key={task._id || idx} className="bg-background border border-border p-4 rounded-lg flex flex-col md:flex-row gap-4 justify-between">
                              <div className="flex-1">
                                 <p className="text-foreground font-medium mb-1">{task.content}</p>
                                 <span className="text-xs text-muted-foreground">{new Date(task.createdAt).toLocaleString()}</span>
                                 {task.adminComment && (
                                    <div className="mt-3 bg-muted/40 p-3 rounded text-sm text-foreground">
                                       <span className="font-semibold block mb-1 text-primary">Admin Feedback:</span>
                                       {task.adminComment}
                                    </div>
                                 )}
                              </div>
                              <div className="flex md:flex-col items-center justify-center md:items-end min-w-[100px]">
                                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${task.status === "approved" ? "bg-green-100 text-green-700 border border-green-200" : task.status === "rejected" ? "bg-red-100 text-red-700 border border-red-200" : "bg-yellow-100 text-yellow-700 border border-yellow-200"}`}>{task.status}</span>
                              </div>
                           </div>
                        ))
                     ) : (
                        <p className="text-muted-foreground text-center py-8">No tasks added yet. Start by adding one below.</p>
                     )}
                  </div>

                  {/* Add Task Form */}
                  <form onSubmit={handleAddTask} className="mt-6 border-t border-border pt-6">
                     <label className="block text-sm font-medium text-foreground mb-2">Add New Task</label>
                     <div className="flex gap-4">
                        <input
                           type="text"
                           value={newTaskContent}
                           onChange={(e) => setNewTaskContent(e.target.value)}
                           placeholder="Describe your task here..." // e.g., 'Completed assignment on loops'
                           className="flex-1 rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                        <button type="submit" disabled={submitting || !newTaskContent.trim()} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                           {submitting ? "Adding..." : "Add Task"}
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         </div>
      </ProtectedRoute>
   );
}

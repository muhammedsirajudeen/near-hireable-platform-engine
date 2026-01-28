"use client";

import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axiosInstance";
import { AxiosError } from "axios";
import { ArrowLeft, Calendar, ChevronDown, ChevronUp, ExternalLink, Mail } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UserInfo {
   _id: string;
   name: string;
   email: string;
   prdStatus: string;
   createdAt: string;
   role: string;
}

interface AdminNote {
   id: string;
   content: string;
   createdAt: string;
}

interface PRD {
   _id: string;
   problemStatement: string;
   targetUsers: string;
   keyFeatures: string;
   successMetrics?: string;
   timeline?: string;
   additionalNotes?: string;
   status: "pending" | "approved" | "rejected";
   adminNotes?: AdminNote[];
   submittedAt: string;
}

export default function AdminUserDetailsPage() {
   const params = useParams();
   const router = useRouter();
   const userId = params.userId as string;

   const [user, setUser] = useState<UserInfo | null>(null);
   const [prds, setPrds] = useState<PRD[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [expandedPrdId, setExpandedPrdId] = useState<string | null>(null);

   useEffect(() => {
      const fetchData = async () => {
         try {
            setLoading(true);
            const [userRes, prdRes] = await Promise.all([axiosInstance.get(`/admin/users/${userId}`), axiosInstance.get(`/admin/prd?userId=${userId}`)]);

            setUser(userRes.data);
            if (prdRes.data.success) {
               setPrds(prdRes.data.data);
            }
         } catch (err: unknown) {
            console.error("Error fetching user data:", err);
            const errorMessage = (err as AxiosError<{ error: string }>)?.response?.data?.error || "Failed to fetch user details";
            setError(errorMessage);
         } finally {
            setLoading(false);
         }
      };

      if (userId) {
         fetchData();
      }
   }, [userId]);

   if (loading) {
      return (
         <div className="flex items-center justify-center h-full min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
         </div>
      );
   }

   if (error || !user) {
      return (
         <div className="flex flex-col items-center justify-center h-full min-h-[50vh] gap-4">
            <p className="text-destructive font-medium">{error || "User not found"}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
         </div>
      );
   }

   return (
      <div className="space-y-6 pt-4 max-w-5xl mx-auto px-4 pb-12">
         {/* Navigation */}
         <div>
            <Button variant="ghost" onClick={() => router.back()} className="pl-0 hover:bg-transparent hover:text-primary gap-2">
               <ArrowLeft className="w-4 h-4" /> Back
            </Button>
         </div>

         {/* Header & User Info */}
         <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between gap-6">
               <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                     <span className="text-2xl font-bold text-primary">{user.name?.charAt(0).toUpperCase() || "U"}</span>
                  </div>
                  <div>
                     <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
                     <div className="flex items-center gap-2 text-muted-foreground mt-1">
                        <Mail className="w-4 h-4" />
                        <span>{user.email}</span>
                     </div>
                     <div className="flex items-center gap-2 text-muted-foreground mt-1 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                     </div>
                     <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-3
                        ${user.prdStatus === "approved" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : user.prdStatus === "pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400"}`}
                     >
                        PRD Status: {user.prdStatus}
                     </span>
                  </div>
               </div>

               <div className="flex flex-col sm:flex-row gap-3">
                  <Link href={`/admin/users/${userId}/modules`}>
                     <Button className="w-full sm:w-auto gap-2">
                        View Modules <ExternalLink className="w-4 h-4" />
                     </Button>
                  </Link>
               </div>
            </div>
         </div>

         {/* User PRDs Section */}
         <div>
            <h2 className="text-xl font-bold mb-4">Submitted PRDs</h2>
            {prds.length === 0 ? (
               <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
                  <p>No PRDs submitted by this user.</p>
               </div>
            ) : (
               <div className="space-y-4">
                  {prds.map((prd) => (
                     <div key={prd._id} className="bg-card rounded-xl border border-border overflow-hidden hover:bg-muted/30 transition-colors">
                        <div className="p-5 cursor-pointer" onClick={() => setExpandedPrdId(expandedPrdId === prd._id ? null : prd._id)}>
                           <div className="flex justify-between items-start mb-2">
                              <span
                                 className={`px-2 py-1 rounded text-xs font-bold uppercase 
                                 ${prd.status === "approved" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : prd.status === "pending" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}
                              >
                                 {prd.status}
                              </span>
                              <div className="flex items-center gap-2">
                                 <span className="text-xs text-muted-foreground">{new Date(prd.submittedAt).toLocaleDateString()}</span>
                                 {expandedPrdId === prd._id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                              </div>
                           </div>
                           <h3 className="font-semibold text-foreground line-clamp-1 mb-1">Problem Statement</h3>
                           <p className="text-muted-foreground text-sm line-clamp-2">{prd.problemStatement}</p>
                        </div>

                        {expandedPrdId === prd._id && (
                           <div className="border-t border-border p-5 space-y-4 bg-muted/10">
                              <PRDSection title="Problem Statement" content={prd.problemStatement} />
                              <PRDSection title="Target Users" content={prd.targetUsers} />
                              <PRDSection title="Key Features" content={prd.keyFeatures} />
                              {prd.successMetrics && <PRDSection title="Success Metrics" content={prd.successMetrics} />}
                              {prd.timeline && <PRDSection title="Timeline" content={prd.timeline} />}
                              {prd.additionalNotes && <PRDSection title="Additional Notes" content={prd.additionalNotes} />}

                              {/* Admin Notes Read-only */}
                              {prd.adminNotes && prd.adminNotes.length > 0 && (
                                 <div className="mt-6 pt-4 border-t border-border">
                                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                       <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                       </svg>
                                       Admin Notes
                                    </h4>
                                    <ul className="space-y-3">
                                       {prd.adminNotes.map((note) => (
                                          <li key={note.id} className="bg-background p-3 rounded-lg border border-border text-sm">
                                             <p className="text-foreground whitespace-pre-wrap">{note.content}</p>
                                             <p className="text-xs text-muted-foreground mt-2">{new Date(note.createdAt).toLocaleString()}</p>
                                          </li>
                                       ))}
                                    </ul>
                                 </div>
                              )}
                           </div>
                        )}
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>
   );
}

function PRDSection({ title, content }: { title: string; content: string }) {
   return (
      <div>
         <h4 className="text-sm font-semibold text-foreground mb-1">{title}</h4>
         <p className="text-muted-foreground whitespace-pre-wrap text-sm">{content}</p>
      </div>
   );
}

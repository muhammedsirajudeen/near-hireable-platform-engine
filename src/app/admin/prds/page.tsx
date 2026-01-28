"use client";

import axiosInstance from "@/lib/axiosInstance";
import { useEffect, useState } from "react";

interface AdminNote {
   id: string;
   content: string;
   createdAt: string;
}

interface PRDUser {
   _id: string;
   name: string;
   email: string;
}

interface PRD {
   _id: string;
   userId: PRDUser;
   problemStatement: string;
   targetUsers: string;
   keyFeatures: string;
   successMetrics?: string;
   timeline?: string;
   additionalNotes?: string;
   status: "pending" | "approved" | "rejected";
   adminNotes?: AdminNote[];
   submittedAt: string;
   approvedAt?: string;
   rejectedAt?: string;
}

export default function AdminPRDsPage() {
   const [prds, setPrds] = useState<PRD[]>([]);
   const [loading, setLoading] = useState(true);
   const [expandedPrdId, setExpandedPrdId] = useState<string | null>(null);
   const [actionLoading, setActionLoading] = useState<string | null>(null);
   const [newNoteContent, setNewNoteContent] = useState<{ [key: string]: string }>({});
   const [showNoteInput, setShowNoteInput] = useState<string | null>(null);

   const [searchQuery, setSearchQuery] = useState("");
   const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
   const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

   useEffect(() => {
      fetchPRDs();
   }, []);

   const fetchPRDs = async () => {
      try {
         setLoading(true);
         const response = await axiosInstance.get("/admin/prd");
         if (response.data.success) {
            setPrds(response.data.data);
         }
      } catch (error) {
         console.error("Failed to fetch PRDs:", error);
      } finally {
         setLoading(false);
      }
   };

   // ... status updates and notes handlers ...

   const filteredPrds = prds
      .filter((prd) => {
         const matchesSearch = (prd.userId?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || (prd.userId?.email || "").toLowerCase().includes(searchQuery.toLowerCase());
         const matchesStatus = statusFilter === "all" || prd.status === statusFilter;
         return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
         const dateA = new Date(a.submittedAt).getTime();
         const dateB = new Date(b.submittedAt).getTime();
         return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      });

   const handleStatusUpdate = async (prdId: string, status: "approved" | "rejected") => {
      try {
         setActionLoading(prdId);
         const response = await axiosInstance.put("/admin/prd", { prdId, status });
         if (response.data.success) {
            fetchPRDs();
         }
      } catch (error) {
         console.error("Failed to update PRD status:", error);
      } finally {
         setActionLoading(null);
      }
   };

   const handleAddNote = async (prdId: string) => {
      const content = newNoteContent[prdId]?.trim();
      if (!content) return;

      try {
         setActionLoading(`note-${prdId}`);
         const response = await axiosInstance.post(`/admin/prd/${prdId}/notes`, { content });
         if (response.data.success) {
            setNewNoteContent((prev) => ({ ...prev, [prdId]: "" }));
            setShowNoteInput(null);
            fetchPRDs();
         }
      } catch (error) {
         console.error("Failed to add note:", error);
      } finally {
         setActionLoading(null);
      }
   };

   const handleDeleteNote = async (prdId: string, noteId: string) => {
      try {
         setActionLoading(`delete-${noteId}`);
         const response = await axiosInstance.delete(`/admin/prd/${prdId}/notes?noteId=${noteId}`);
         if (response.data.success) {
            fetchPRDs();
         }
      } catch (error) {
         console.error("Failed to delete note:", error);
      } finally {
         setActionLoading(null);
      }
   };

   const getStatusBadge = (status: string) => {
      const styles = {
         pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
         approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
         rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      };
      return styles[status as keyof typeof styles] || styles.pending;
   };

   return (
      <div className="space-y-4 pt-4">
         <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
               <h2 className="text-2xl font-bold tracking-tight text-foreground">PRD Management</h2>
               <p className="text-muted-foreground">Review and manage user PRDs</p>
            </div>
         </div>

         {/* Filters and Search */}
         <div className="flex flex-col gap-3 sm:flex-row bg-card p-3 rounded-lg border border-border">
            <div className="relative flex-1">
               <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
               <input type="text" placeholder="Search by user or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="flex gap-3">
               <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
               </select>
               <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)} className="px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
               </select>
            </div>
         </div>

         {loading ? (
            <div className="flex items-center justify-center py-12">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
         ) : filteredPrds.length === 0 ? (
            <div className="text-center py-12">
               <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
               <p className="mt-4 text-muted-foreground">No PRDs found</p>
            </div>
         ) : (
            <div className="space-y-4">
               {filteredPrds.map((prd) => (
                  <div key={prd._id} className="bg-card text-card-foreground rounded-xl border border-border overflow-hidden">
                     {/* PRD Header */}
                     <div className="p-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setExpandedPrdId(expandedPrdId === prd._id ? null : prd._id)}>
                        <div className="flex items-center justify-between">
                           <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                 <span className="text-sm font-bold text-primary">{prd.userId?.name?.charAt(0).toUpperCase() || "?"}</span>
                              </div>
                              <div>
                                 <p className="font-medium text-foreground">{prd.userId?.name || "Unknown User"}</p>
                                 <p className="text-sm text-muted-foreground">{prd.userId?.email}</p>
                              </div>
                           </div>
                           <div className="flex items-center space-x-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(prd.status)}`}>{prd.status.charAt(0).toUpperCase() + prd.status.slice(1)}</span>
                              <span className="text-xs text-muted-foreground">{new Date(prd.submittedAt).toLocaleDateString()}</span>
                              <svg className={`w-5 h-5 text-muted-foreground transition-transform ${expandedPrdId === prd._id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                           </div>
                        </div>
                     </div>

                     {/* PRD Details (Expanded) */}
                     {expandedPrdId === prd._id && (
                        <div className="border-t border-border p-4 space-y-4">
                           <PRDSection title="Problem Statement" content={prd.problemStatement} />
                           <PRDSection title="Target Users" content={prd.targetUsers} />
                           <PRDSection title="Key Features" content={prd.keyFeatures} />
                           {prd.successMetrics && <PRDSection title="Success Metrics" content={prd.successMetrics} />}
                           {prd.timeline && <PRDSection title="Timeline" content={prd.timeline} />}
                           {prd.additionalNotes && <PRDSection title="Additional Notes" content={prd.additionalNotes} />}

                           {/* Admin Notes Section */}
                           <div className="mt-6 pt-4 border-t border-border">
                              <div className="flex items-center justify-between mb-3">
                                 <h4 className="font-semibold text-foreground flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                    </svg>
                                    Admin Notes
                                 </h4>
                                 <button
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       setShowNoteInput(showNoteInput === prd._id ? null : prd._id);
                                    }}
                                    className="flex items-center space-x-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm"
                                 >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span>Add Note</span>
                                 </button>
                              </div>

                              {/* Add Note Input */}
                              {showNoteInput === prd._id && (
                                 <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                                    <textarea
                                       value={newNoteContent[prd._id] || ""}
                                       onChange={(e) => setNewNoteContent((prev) => ({ ...prev, [prd._id]: e.target.value }))}
                                       placeholder="Enter your feedback note..."
                                       className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                       rows={2}
                                       maxLength={500}
                                    />
                                    <div className="flex items-center justify-between mt-2">
                                       <span className="text-xs text-muted-foreground">{(newNoteContent[prd._id] || "").length}/500</span>
                                       <div className="flex space-x-2">
                                          <button onClick={() => setShowNoteInput(null)} className="px-3 py-1.5 text-sm text-foreground hover:bg-muted rounded-lg transition-colors">
                                             Cancel
                                          </button>
                                          <button onClick={() => handleAddNote(prd._id)} disabled={actionLoading === `note-${prd._id}` || !newNoteContent[prd._id]?.trim()} className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                             {actionLoading === `note-${prd._id}` ? "Adding..." : "Add"}
                                          </button>
                                       </div>
                                    </div>
                                 </div>
                              )}

                              {/* Notes List */}
                              {prd.adminNotes && prd.adminNotes.length > 0 ? (
                                 <ul className="space-y-2">
                                    {prd.adminNotes.map((note) => (
                                       <li key={note.id} className="flex items-start space-x-3 p-2 bg-muted/50 rounded-lg group">
                                          <span className="w-2 h-2 mt-2 rounded-full bg-primary shrink-0"></span>
                                          <div className="flex-1 min-w-0">
                                             <p className="text-sm text-foreground">{note.content}</p>
                                             <p className="text-xs text-muted-foreground mt-1">{new Date(note.createdAt).toLocaleString()}</p>
                                          </div>
                                          <button onClick={() => handleDeleteNote(prd._id, note.id)} disabled={actionLoading === `delete-${note.id}`} className="opacity-0 group-hover:opacity-100 p-1 text-destructive hover:bg-destructive/10 rounded transition-all">
                                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                             </svg>
                                          </button>
                                       </li>
                                    ))}
                                 </ul>
                              ) : (
                                 <p className="text-sm text-muted-foreground italic">No notes yet</p>
                              )}
                           </div>

                           {/* Action Buttons */}
                           <div className="flex items-center space-x-3 pt-4 border-t border-border">
                              <button
                                 onClick={() => handleStatusUpdate(prd._id, "approved")}
                                 disabled={actionLoading === prd._id || prd.status === "approved"}
                                 className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                 </svg>
                                 <span>{actionLoading === prd._id ? "Processing..." : "Approve"}</span>
                              </button>
                              <button
                                 onClick={() => handleStatusUpdate(prd._id, "rejected")}
                                 disabled={actionLoading === prd._id || prd.status === "rejected"}
                                 className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                 </svg>
                                 <span>{actionLoading === prd._id ? "Processing..." : "Reject"}</span>
                              </button>
                           </div>
                        </div>
                     )}
                  </div>
               ))}
            </div>
         )}
      </div>
   );
}

function PRDSection({ title, content }: { title: string; content: string }) {
   return (
      <div>
         <h4 className="text-sm font-semibold text-foreground mb-1">{title}</h4>
         <p className="text-muted-foreground whitespace-pre-wrap">{content}</p>
      </div>
   );
}

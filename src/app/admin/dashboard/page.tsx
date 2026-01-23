"use client";

import axiosInstance from "@/lib/axiosInstance";
import { useEffect, useState } from "react";

interface AuthorisedEmail {
   id: string;
   email: string;
   createdAt: string;
}

export default function AdminDashboardPage() {
   const [authorisedEmails, setAuthorisedEmails] = useState<AuthorisedEmail[]>([]);
   const [newEmail, setNewEmail] = useState("");
   const [loading, setLoading] = useState(false);
   const [fetchingEmails, setFetchingEmails] = useState(true);
   const [error, setError] = useState("");
   const [success, setSuccess] = useState("");

   useEffect(() => {
      fetchAuthorisedEmails();
   }, []);

   const fetchAuthorisedEmails = async () => {
      try {
         setFetchingEmails(true);
         const response = await axiosInstance.get("/admin/authorised-email");
         if (response.data.success) {
            setAuthorisedEmails(response.data.data);
         }
      } catch (err) {
         console.error("Failed to fetch authorized emails:", err);
      } finally {
         setFetchingEmails(false);
      }
   };

   const handleAddEmail = async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setSuccess("");
      setLoading(true);

      try {
         const response = await axiosInstance.post("/admin/authorised-email", {
            email: newEmail,
         });

         if (response.data.success) {
            setSuccess(`Email ${newEmail} added successfully!`);
            setNewEmail("");
            fetchAuthorisedEmails();
         }
      } catch (err: unknown) {
         setError(err instanceof Error && "response" in err ? (err as Error & { response?: { data?: { error?: string } } }).response?.data?.error || "Failed to add email" : "Failed to add email");
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="space-y-4 pt-4">
         {/* Main Content */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Add Email Form */}
            <div className="bg-card text-card-foreground rounded-2xl shadow-xl border border-border p-6">
               <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mr-4">
                     <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                     </svg>
                  </div>
                  <div>
                     <h2 className="text-xl font-bold text-card-foreground">Add Authorized Email</h2>
                     <p className="text-sm text-muted-foreground">Allow users to sign up with this email</p>
                  </div>
               </div>

               <form onSubmit={handleAddEmail} className="space-y-4">
                  {error && (
                     <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                        <p className="text-sm text-destructive">{error}</p>
                     </div>
                  )}

                  {success && (
                     <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                        <p className="text-sm text-primary">{success}</p>
                     </div>
                  )}

                  <div>
                     <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                        Email Address
                     </label>
                     <input type="email" id="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all" placeholder="user@example.com" required />
                  </div>

                  <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                     {loading ? (
                        <span className="flex items-center justify-center">
                           <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                           Adding...
                        </span>
                     ) : (
                        "Add Email"
                     )}
                  </button>
               </form>
            </div>

            {/* Authorized Emails List */}
            <div className="bg-card text-card-foreground rounded-2xl shadow-xl border border-border p-6">
               <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mr-4">
                     <svg className="w-6 h-6 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                  </div>
                  <div>
                     <h2 className="text-xl font-bold text-card-foreground">Authorized Emails</h2>
                     <p className="text-sm text-muted-foreground">
                        {authorisedEmails.length} {authorisedEmails.length === 1 ? "email" : "emails"} authorized
                     </p>
                  </div>
               </div>

               {fetchingEmails ? (
                  <div className="flex items-center justify-center py-12">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
               ) : authorisedEmails.length === 0 ? (
                  <div className="text-center py-12">
                     <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                     </svg>
                     <p className="mt-4 text-muted-foreground">No authorized emails yet</p>
                     <p className="text-sm text-muted-foreground mt-1">Add an email to get started</p>
                  </div>
               ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                     {authorisedEmails.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                           <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                 <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                 </svg>
                              </div>
                              <div>
                                 <p className="font-medium text-foreground">{item.email}</p>
                                 <p className="text-xs text-muted-foreground">Added {new Date(item.createdAt).toLocaleDateString()}</p>
                              </div>
                           </div>
                           <div className="flex items-center space-x-2">
                              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">Active</span>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}

"use client";

import axiosInstance from "@/lib/axiosInstance";
import Link from "next/link";
import { useEffect, useState } from "react";

interface User {
   _id: string;
   name: string;
   email: string;
   prdStatus: string;
   createdAt: string;
}

export default function AdminUsersPage() {
   const [users, setUsers] = useState<User[]>([]);
   const [loading, setLoading] = useState(true);

   const [searchQuery, setSearchQuery] = useState("");
   const [prdStatusFilter, setPrdStatusFilter] = useState<string>("all");
   const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: "asc" | "desc" } | null>(null);

   useEffect(() => {
      fetchUsers();
   }, []);

   const fetchUsers = async () => {
      try {
         const response = await axiosInstance.get("/admin/users");
         setUsers(response.data);
      } catch (error) {
         console.error("Failed to fetch users", error);
      } finally {
         setLoading(false);
      }
   };

   const filteredUsers = users
      .filter((user) => {
         const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase());
         const matchesStatus = prdStatusFilter === "all" || user.prdStatus === prdStatusFilter;
         return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
         if (!sortConfig) return 0;
         const { key, direction } = sortConfig;
         if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
         if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
         return 0;
      });

   const requestSort = (key: keyof User) => {
      let direction: "asc" | "desc" = "asc";
      if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
         direction = "desc";
      }
      setSortConfig({ key, direction });
   };

   const getSortIcon = (key: keyof User) => {
      if (!sortConfig || sortConfig.key !== key) {
         return (
            <svg className="w-4 h-4 ml-1 text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
         );
      }
      return sortConfig.direction === "asc" ? (
         <svg className="w-4 h-4 ml-1 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
         </svg>
      ) : (
         <svg className="w-4 h-4 ml-1 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
         </svg>
      );
   };

   if (loading) {
      return (
         <div className="flex justify-center items-center h-screen bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
         </div>
      );
   }

   return (
      <div className="space-y-4 pt-4">
         <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-3xl font-bold">User Management</h1>
         </div>

         {/* Search and Filters */}
         <div className="flex flex-col gap-3 sm:flex-row bg-card p-3 rounded-lg border border-border mb-4">
            <div className="relative flex-1">
               <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
               <input type="text" placeholder="Search by name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <select value={prdStatusFilter} onChange={(e) => setPrdStatusFilter(e.target.value)} className="px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary min-w-[150px]">
               <option value="all">All PRD Status</option>
               <option value="pending">Pending</option>
               <option value="approved">Approved</option>
               <option value="rejected">Rejected</option>
            </select>
         </div>

         <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <table className="w-full text-left">
               <thead className="bg-muted/50 border-b border-border">
                  <tr>
                     <th className="px-6 py-4 font-semibold text-muted-foreground cursor-pointer hover:bg-muted/70 transition-colors" onClick={() => requestSort("name")}>
                        <div className="flex items-center">
                           Name
                           {getSortIcon("name")}
                        </div>
                     </th>
                     <th className="px-6 py-4 font-semibold text-muted-foreground cursor-pointer hover:bg-muted/70 transition-colors" onClick={() => requestSort("email")}>
                        <div className="flex items-center">
                           Email
                           {getSortIcon("email")}
                        </div>
                     </th>
                     <th className="px-6 py-4 font-semibold text-muted-foreground cursor-pointer hover:bg-muted/70 transition-colors" onClick={() => requestSort("prdStatus")}>
                        <div className="flex items-center">
                           PRD Status
                           {getSortIcon("prdStatus")}
                        </div>
                     </th>
                     <th className="px-6 py-4 font-semibold text-muted-foreground cursor-pointer hover:bg-muted/70 transition-colors" onClick={() => requestSort("createdAt")}>
                        <div className="flex items-center">
                           Joined
                           {getSortIcon("createdAt")}
                        </div>
                     </th>
                     <th className="px-6 py-4 font-semibold text-muted-foreground">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-border">
                  {filteredUsers.map((user) => (
                     <tr key={user._id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4">
                           <Link href={`/admin/users/${user._id}`} className="hover:underline font-medium">
                              {user.name}
                           </Link>
                        </td>
                        <td className="px-6 py-4">{user.email}</td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.prdStatus === "approved" ? "bg-green-100 text-green-700" : user.prdStatus === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}>{user.prdStatus}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                           <Link href={`/admin/users/${user._id}/modules`} className="text-primary hover:underline font-medium">
                              View Modules
                           </Link>
                        </td>
                     </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                     <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                           No users found.
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
   );
}

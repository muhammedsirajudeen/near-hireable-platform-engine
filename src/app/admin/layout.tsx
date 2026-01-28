"use client";

import { AppSidebar } from "@/components/app-sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminProvider } from "@/contexts/AdminContext";
import { usePathname } from "next/navigation";

function AdminHeader() {
   const pathname = usePathname();
   const segments = pathname.split("/").filter(Boolean).slice(1); // remove 'admin'
   // Simple breadcrumbs mapping
   const breadcrumbs = segments.map((segment, index) => {
      const href = `/admin/${segments.slice(0, index + 1).join("/")}`;
      const isLast = index === segments.length - 1;
      const title = segment.charAt(0).toUpperCase() + segment.slice(1);

      return (
         <div key={href} className="flex items-center">
            <BreadcrumbItem>{isLast ? <BreadcrumbPage>{title}</BreadcrumbPage> : <BreadcrumbLink href={href}>{title}</BreadcrumbLink>}</BreadcrumbItem>
            {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
         </div>
      );
   });

   return (
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b">
         <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
               <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                     <BreadcrumbLink href="/admin/dashboard">Admin</BreadcrumbLink>
                  </BreadcrumbItem>
                  {breadcrumbs.length > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                  {breadcrumbs}
               </BreadcrumbList>
            </Breadcrumb>
         </div>
      </header>
   );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
   const pathname = usePathname();

   if (pathname === "/admin/login") {
      return <>{children}</>;
   }

   return (
      <ProtectedRoute requireAdmin>
         <AdminProvider>
            <SidebarProvider>
               <AppSidebar />
               <SidebarInset>
                  <AdminHeader />
                  <div className="flex-1 flex flex-col p-4 pt-0 ">{children}</div>
               </SidebarInset>
            </SidebarProvider>
         </AdminProvider>
      </ProtectedRoute>
   );
}

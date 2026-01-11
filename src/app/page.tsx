"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function LandingPage() {
   const { user, isAuthenticated } = useAuth();
   const router = useRouter();

   const handleGetStarted = () => {
      if (isAuthenticated && user) {
         // If user is signed in, check PRD status
         if (user.prdStatus === "approved") {
            router.push("/dashboard");
         } else {
            router.push("/prd");
         }
      } else {
         // Not signed in, go to signin
         router.push("/signin");
      }
   };

   return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
         <div className="max-w-5xl w-full text-center">
            {/* Logo/Brand */}
            <div className="mb-12">
               <h1 className="text-6xl md:text-8xl font-bold text-foreground mb-4">
                  Near Hireable
               </h1>
               <div className="h-1 w-32 bg-primary mx-auto"></div>
            </div>

            {/* Main Heading */}
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
               Welcome to the{" "}
               <span className="text-primary">
                  Near Hireable Engine
               </span>
            </h2>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
               Most developers are unemployable because they don't know where they stand. We fix that.
            </p>

            {/* CTA Button */}
            <button
               onClick={handleGetStarted}
               className="inline-block bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-lg px-12 py-4 rounded-full transition-all duration-300 transform hover:scale-105"
            >
               Get Started
            </button>

            {/* Features Grid */}
            <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="bg-card border border-border rounded-2xl p-8 hover:border-primary transition-all duration-300">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                     <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                  </div>
                  <h3 className="text-xl font-bold text-card-foreground mb-3">Unhireable?</h3>
                  <p className="text-muted-foreground">
                     If your fundamentals are shaky and you need foundational work
                  </p>
               </div>

               <div className="bg-card border border-border rounded-2xl p-8 hover:border-primary transition-all duration-300">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                     <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                     </svg>
                  </div>
                  <h3 className="text-xl font-bold text-card-foreground mb-3">Near-Hireable?</h3>
                  <p className="text-muted-foreground">
                     You have the basics but need to pass the bar to get hired
                  </p>
               </div>

               <div className="bg-card border border-border rounded-2xl p-8 hover:border-primary transition-all duration-300">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                     <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                     </svg>
                  </div>
                  <h3 className="text-xl font-bold text-card-foreground mb-3">Hireable?</h3>
                  <p className="text-muted-foreground">
                     You already have what it takes, we simply prove it
                  </p>
               </div>
            </div>
         </div>
      </div>
   );
}

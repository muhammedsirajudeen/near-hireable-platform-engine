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
      <div className="min-h-screen bg-background flex flex-col justify-center px-4 py-16 md:py-24">
         <div className="max-w-5xl w-full mx-auto text-center">
            {/* Brand Identity - Secondary visual weight */}
            <div className="mb-8 md:mb-10">
               <span className="text-primary font-semibold text-lg md:text-xl tracking-wider uppercase">
                  Near Hireable
               </span>
               <div className="h-0.5 w-16 bg-primary mx-auto mt-3"></div>
            </div>

            {/* Main Value Proposition - Primary visual weight (H1) */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
               Transform from{" "}
               <span className="text-primary">
                  Unemployable
               </span>
               {" "}to{" "}
               <span className="text-primary">
                  Hireable
               </span>
            </h1>

            {/* Supporting Statement */}
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed">
               Most developers don&apos;t know where they stand. We assess, guide, and prove your readiness to employers.
            </p>

            {/* Primary CTA Button */}
            <button
               onClick={handleGetStarted}
               className="inline-block bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-lg px-10 md:px-14 py-4 md:py-5 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
               Get Started
            </button>

            {/* Features Grid - Supporting content */}
            <div className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
               <div className="bg-card border border-border rounded-2xl p-6 md:p-8 hover:border-primary transition-all duration-300 hover:shadow-lg">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                     <svg className="w-7 h-7 md:w-8 md:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-card-foreground mb-2">Unhireable?</h2>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                     If your fundamentals are shaky, we&apos;ll help you build a solid foundation.
                  </p>
               </div>

               <div className="bg-card border border-border rounded-2xl p-6 md:p-8 hover:border-primary transition-all duration-300 hover:shadow-lg">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                     <svg className="w-7 h-7 md:w-8 md:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                     </svg>
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-card-foreground mb-2">Near-Hireable?</h2>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                     You have the basics but need to pass the bar to get hired.
                  </p>
               </div>

               <div className="bg-card border border-border rounded-2xl p-6 md:p-8 hover:border-primary transition-all duration-300 hover:shadow-lg">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                     <svg className="w-7 h-7 md:w-8 md:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                     </svg>
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-card-foreground mb-2">Hireable?</h2>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                     You already have what it takes, we simply prove it to employers.
                  </p>
               </div>
            </div>
         </div>
      </div>
   );
}

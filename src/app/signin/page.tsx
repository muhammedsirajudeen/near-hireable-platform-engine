"use client";

import PublicRoute from "@/components/PublicRoute";
import { useAuth } from "@/contexts/AuthContext";
import axiosInstance from "@/lib/axiosInstance";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

declare global {
   interface Window {
      google?: {
         accounts: {
            id: {
               initialize: (config: {
                  client_id: string;
                  callback: (response: { credential: string }) => void;
               }) => void;
               renderButton: (
                  element: HTMLElement,
                  config: {
                     theme?: string;
                     size?: string;
                     width?: number;
                     text?: string;
                     shape?: string;
                  }
               ) => void;
            };
         };
      };
   }
}

export default function SignInPage() {
   const [error, setError] = useState("");
   const [loading, setLoading] = useState(false);
   const { googleLogin } = useAuth();
   const router = useRouter();

   const handleGoogleResponse = useCallback(
      async (response: { credential: string }) => {
         setError("");
         setLoading(true);

         try {
            await googleLogin(response.credential);

            // Check user's PRD status and redirect accordingly
            const userResponse = await axiosInstance.get("/auth/me");
            const user = userResponse.data.user;

            if (user.prdStatus === "approved") {
               router.push("/dashboard");
            } else {
               router.push("/prd");
            }
         } catch (err: unknown) {
            console.error("Google login error:", err);

            // Check if it's an authorization error (403)
            if (err && typeof err === "object" && "response" in err) {
               const axiosError = err as { response?: { status?: number; data?: { error?: string } } };

               if (axiosError.response?.status === 403) {
                  // User is not registered for the program
                  setError("not_registered");
               } else {
                  setError(axiosError.response?.data?.error || "authentication_failed");
               }
            } else {
               setError("authentication_failed");
            }
         } finally {
            setLoading(false);
         }
      },
      [googleLogin, router]
   );

   useEffect(() => {
      // Load Google Identity Services script
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = () => {
         if (window.google) {
            window.google.accounts.id.initialize({
               client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
               callback: handleGoogleResponse,
            });

            const buttonDiv = document.getElementById("google-signin-button");
            if (buttonDiv) {
               window.google.accounts.id.renderButton(buttonDiv, {
                  theme: "filled_black",
                  size: "large",
                  width: 380,
                  text: "continue_with",
                  shape: "pill",
               });
            }
         }
      };

      return () => {
         document.body.removeChild(script);
      };
   }, [handleGoogleResponse]);

   return (
      <PublicRoute>

         <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-primary/5 px-4">
            <div className="max-w-md w-full">
               {/* Card */}
               <div className="bg-card/50 backdrop-blur-sm rounded-2xl shadow-xl border border-border p-8 md:p-10">
                  {/* Header */}
                  <div className="text-center mb-8">
                     <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4">
                        <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                     </div>
                     <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">Welcome Back</h1>
                     <p className="text-muted-foreground">Sign in to your account</p>
                  </div>

                  {/* Error Message */}
                  {error && (
                     <div className="mb-6">
                        {error === "not_registered" ? (
                           <div className="bg-card border-2 border-primary/20 rounded-xl p-6 space-y-4">
                              <div className="flex items-start space-x-3">
                                 <div className="flex-shrink-0">
                                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                 </div>
                                 <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-card-foreground mb-2">
                                       Not Registered Yet
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                       Your email isn't registered for the Near Hireable Engine program yet. To get access, please contact our team.
                                    </p>
                                    <div className="bg-muted rounded-lg p-4 space-y-3">
                                       <p className="text-sm font-medium text-card-foreground">Get Access:</p>
                                       <a
                                          href="https://twitter.com/messages/compose?recipient_id=YOUR_TWITTER_ID"
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center space-x-2 text-primary hover:text-primary-hover transition-colors"
                                       >
                                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                             <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                          </svg>
                                          <span className="text-sm font-medium">DM us on Twitter/X</span>
                                       </a>
                                       <p className="text-xs text-muted-foreground">
                                          We'll review your request and add your email to the program.
                                       </p>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ) : (
                           <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                              <p className="text-sm text-destructive">
                                 {error === "authentication_failed"
                                    ? "Authentication failed. Please try again."
                                    : error}
                              </p>
                           </div>
                        )}
                     </div>
                  )}

                  {/* Loading State */}
                  {loading && (
                     <div className="flex items-center justify-center py-4 mb-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-3 text-muted-foreground">Signing in...</span>
                     </div>
                  )}

                  {/* Google Sign In Button */}
                  <div className="flex justify-center">
                     <div id="google-signin-button"></div>
                  </div>

                  {/* Info Text */}
                  <p className="text-center text-sm text-muted-foreground mt-6">
                     Only authorized emails can sign in.
                     <br />
                     Contact admin if you need access.
                  </p>
               </div>
            </div>
         </div>
      </PublicRoute>
   );
}

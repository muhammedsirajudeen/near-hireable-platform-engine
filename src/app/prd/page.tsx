"use client";

import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import axiosInstance from "@/lib/axiosInstance";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const prdSchema = z.object({
    problemStatement: z.string().min(50, "Problem statement must be at least 50 characters").max(2000),
    targetUsers: z.string().min(10, "Target users must be at least 10 characters").max(500),
    keyFeatures: z.string().min(50, "Key features must be at least 50 characters").max(2000),
    successMetrics: z.string().max(1000).optional(),
    timeline: z.string().max(500).optional(),
    additionalNotes: z.string().max(1000).optional(),
});

type PRDFormValues = z.infer<typeof prdSchema>;

interface AdminNote {
    id: string;
    content: string;
    createdAt: string;
}

interface ExistingPRD {
    _id: string;
    status: string;
    problemStatement: string;
    targetUsers: string;
    keyFeatures: string;
    successMetrics?: string;
    timeline?: string;
    additionalNotes?: string;
    adminNotes?: AdminNote[];
}

export default function PRDPage() {
    const { checkAuth } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [existingPRD, setExistingPRD] = useState<ExistingPRD | null>(null);
    const [fetchingPRD, setFetchingPRD] = useState(true);

    const form = useForm<PRDFormValues>({
        resolver: zodResolver(prdSchema),
        defaultValues: {
            problemStatement: "",
            targetUsers: "",
            keyFeatures: "",
            successMetrics: "",
            timeline: "",
            additionalNotes: "",
        },
    });

    useEffect(() => {
        fetchPRD();
    }, []);

    const fetchPRD = async () => {
        try {
            setFetchingPRD(true);
            const response = await axiosInstance.get("/prd");
            if (response.data.success && response.data.data) {
                const prd = response.data.data;
                setExistingPRD(prd);
                form.reset({
                    problemStatement: prd.problemStatement || "",
                    targetUsers: prd.targetUsers || "",
                    keyFeatures: prd.keyFeatures || "",
                    successMetrics: prd.successMetrics || "",
                    timeline: prd.timeline || "",
                    additionalNotes: prd.additionalNotes || "",
                });
            }
        } catch (error) {
            console.error("Failed to fetch PRD:", error);
        } finally {
            setFetchingPRD(false);
        }
    };

    const onSubmit = async (data: PRDFormValues) => {
        try {
            setLoading(true);
            const method = existingPRD ? "put" : "post";
            const response = await axiosInstance[method]("/prd", data);

            if (response.data.success) {
                await checkAuth();
                router.push("/prd");
                window.location.reload();
            }
        } catch (error) {
            console.error("Failed to submit PRD:", error);
            alert("Failed to submit PRD. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getPRDStatus = () => {
        if (!existingPRD) return null;
        const status = existingPRD.status;
        if (status === "approved") return { text: "Approved", color: "bg-green-500" };
        if (status === "rejected") return { text: "Rejected", color: "bg-red-500" };
        return { text: "Pending Review", color: "bg-yellow-500" };
    };

    const prdStatus = getPRDStatus();

    if (fetchingPRD) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background">
                {/* Navbar */}
                <Navbar />

                {/* Page Header */}
                <div className="bg-card border-b border-border">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-card-foreground">Product Requirements Document</h1>
                                <p className="text-muted-foreground mt-1">Tell us about your project</p>
                            </div>
                            {prdStatus && (
                                <span className={`px-4 py-2 rounded-full text-white text-sm font-medium ${prdStatus.color}`}>
                                    {prdStatus.text}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Admin Notes Section */}
                {existingPRD?.adminNotes && existingPRD.adminNotes.length > 0 && (
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800/50 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-amber-800 dark:text-amber-200">Admin Feedback</h3>
                                    <p className="text-sm text-amber-600 dark:text-amber-400">Please review the notes below and update your PRD accordingly</p>
                                </div>
                            </div>
                            <ul className="space-y-2">
                                {existingPRD.adminNotes.map((note) => (
                                    <li key={note.id} className="flex items-start space-x-3">
                                        <span className="w-2 h-2 mt-2 rounded-full bg-amber-500 flex-shrink-0"></span>
                                        <div className="flex-1">
                                            <p className="text-amber-800 dark:text-amber-200">{note.content}</p>
                                            <p className="text-xs text-amber-500 dark:text-amber-500 mt-1">
                                                {new Date(note.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Form */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
                    <div className="bg-card rounded-xl shadow-lg border border-border p-8">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="problemStatement"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Problem Statement *</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Describe the problem you're trying to solve..."
                                                    className="min-h-32"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>What problem are you solving? (50-2000 characters)</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="targetUsers"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Target Users *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Developers, Students, Small businesses..." {...field} />
                                            </FormControl>
                                            <FormDescription>Who will use this product?</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="keyFeatures"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Key Features *</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="List the main features of your product..."
                                                    className="min-h-32"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>What are the core features? (50-2000 characters)</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="successMetrics"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Success Metrics (Optional)</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="How will you measure success? e.g., user adoption, engagement..."
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>Define your success criteria</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="timeline"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Timeline (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., 3 months, Q2 2024..." {...field} />
                                            </FormControl>
                                            <FormDescription>Expected timeline for development</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="additionalNotes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Additional Notes (Optional)</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Any other information you'd like to share..." {...field} />
                                            </FormControl>
                                            <FormDescription>Additional context or requirements</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex items-center justify-between pt-4">
                                    <p className="text-sm text-muted-foreground">* Required fields</p>
                                    <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary-hover">
                                        {loading ? (
                                            <span className="flex items-center">
                                                <svg
                                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                {existingPRD ? "Updating..." : "Submitting..."}
                                            </span>
                                        ) : existingPRD ? (
                                            "Update PRD"
                                        ) : (
                                            "Submit PRD"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

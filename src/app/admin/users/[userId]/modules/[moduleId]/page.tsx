"use client";

import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import axiosInstance from "@/lib/axiosInstance";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserRole } from "@/types/enums/role.enum";
import { ITask, IStandup, ModuleStatus } from "@/models/UserModule";

// Re-defining client-side interfaces
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

export default function AdminModuleManagePage() {
    const params = useParams();
    const router = useRouter();
    const { userId, moduleId } = params;
    const [moduleData, setModuleData] = useState<ClientModule | null>(null);
    const [loading, setLoading] = useState(true);

    // Form states
    const [standupDate, setStandupDate] = useState(new Date().toISOString().split('T')[0]);
    const [standupAttended, setStandupAttended] = useState(true);
    const [standupReview, setStandupReview] = useState("");
    const [standupStatus, setStandupStatus] = useState<"complete" | "incomplete">("complete");
    const [submittingStandup, setSubmittingStandup] = useState(false);

    // Comment states
    const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
    const [commentText, setCommentText] = useState("");

    useEffect(() => {
        if (userId && moduleId) fetchModuleData();
    }, [userId, moduleId]);

    const fetchModuleData = async () => {
        try {
            const response = await axiosInstance.get(`/admin/users/${userId}/modules/${moduleId}`);
            setModuleData(response.data);
        } catch (error) {
            console.error("Failed to fetch module details", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTaskAction = async (taskId: string, status: string, comment?: string) => {
        try {
            await axiosInstance.patch(`/admin/users/${userId}/modules/${moduleId}`, {
                action: 'update_task',
                taskId,
                status,
                adminComment: comment
            });
            fetchModuleData(); // Refresh data
            setActiveCommentId(null);
            setCommentText("");
        } catch (error) {
            console.error("Failed to update task", error);
        }
    };

    const handleAddStandup = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingStandup(true);
        try {
            await axiosInstance.patch(`/admin/users/${userId}/modules/${moduleId}`, {
                action: 'add_standup',
                date: standupDate,
                attended: standupAttended,
                review: standupReview,
                status: standupStatus
            });
            fetchModuleData(); // Refresh data
            setStandupReview(""); // Reset review but keep date/status as they might add multiple? Actually reset is better
        } catch (error) {
            console.error("Failed to add standup", error);
        } finally {
            setSubmittingStandup(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!moduleData) return <div className="text-center py-20">Module not found</div>;

    return (
        <ProtectedRoute requireAdmin={true}>
            <div className="min-h-screen bg-background text-foreground pb-20">
                <Navbar />
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="flex items-center gap-4 mb-8">
                        <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground">
                            ← Back
                        </button>
                        <h1 className="text-3xl font-bold">Manage Module {moduleData.moduleId}</h1>
                    </div>

                    {/* Module Status Management */}
                    <div className="bg-card border border-border p-6 rounded-xl shadow-sm mb-8 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold mb-1">Module Status</h2>
                            <p className="text-muted-foreground text-sm">Current Status: <span className="font-semibold uppercase text-primary">{moduleData.status}</span></p>
                        </div>
                        <div className="flex gap-3">
                            {moduleData.status !== "unlocked" && (
                                <button
                                    onClick={async () => {
                                        try {
                                            await axiosInstance.patch(`/admin/users/${userId}/modules/${moduleId}`, {
                                                action: 'update_module_status',
                                                status: 'unlocked'
                                            });
                                            fetchModuleData();
                                        } catch (e) {
                                            console.error("Failed to unlock", e);
                                        }
                                    }}
                                    className="px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 transition"
                                >
                                    Unlock Module
                                </button>
                            )}
                            {moduleData.status !== "locked" && (
                                <button
                                    onClick={async () => {
                                        try {
                                            await axiosInstance.patch(`/admin/users/${userId}/modules/${moduleId}`, {
                                                action: 'update_module_status',
                                                status: 'locked'
                                            });
                                            fetchModuleData();
                                        } catch (e) {
                                            console.error("Failed to lock", e);
                                        }
                                    }}
                                    className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition"
                                >
                                    Lock Module
                                </button>
                            )}
                            {moduleData.status !== "completed" && (
                                <button
                                    onClick={async () => {
                                        try {
                                            await axiosInstance.patch(`/admin/users/${userId}/modules/${moduleId}`, {
                                                action: 'update_module_status',
                                                status: 'completed'
                                            });
                                            fetchModuleData();
                                        } catch (e) {
                                            console.error("Failed to complete", e);
                                        }
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition"
                                >
                                    Mark Completed
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">

                        {/* LEFT COLUMN: TASKS */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold flex items-center">
                                <span className="w-2 h-8 bg-secondary rounded-full mr-3"></span>
                                User Tasks
                            </h2>

                            <div className="space-y-4">
                                {moduleData.tasks && moduleData.tasks.length > 0 ? (
                                    moduleData.tasks.slice().reverse().map((task) => (
                                        <div key={task._id} className="bg-card border border-border p-6 rounded-xl shadow-sm">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="font-medium text-lg mb-1">{task.content}</p>
                                                    <span className="text-sm text-muted-foreground">
                                                        Added: {new Date(task.createdAt).toLocaleString()}
                                                    </span>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${task.status === "approved" ? "bg-green-100 text-green-700" :
                                                    task.status === "rejected" ? "bg-red-100 text-red-700" :
                                                        "bg-yellow-100 text-yellow-700"
                                                    }`}>
                                                    {task.status}
                                                </span>
                                            </div>

                                            {task.adminComment && (
                                                <div className="bg-muted/40 p-3 rounded mb-4 text-sm">
                                                    <span className="font-semibold block text-primary">Your Comment:</span>
                                                    {task.adminComment}
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                                                {activeCommentId === task._id ? (
                                                    <div className="w-full space-y-2">
                                                        <textarea
                                                            value={commentText}
                                                            onChange={(e) => setCommentText(e.target.value)}
                                                            className="w-full p-2 border rounded bg-background text-foreground text-sm"
                                                            placeholder="Add a comment..."
                                                            rows={2}
                                                        />
                                                        <div className="flex gap-2 justify-end">
                                                            <button
                                                                onClick={() => setActiveCommentId(null)}
                                                                className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={() => handleTaskAction(task._id, task.status, commentText)} // Just update comment
                                                                className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
                                                            >
                                                                Save Comment
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleTaskAction(task._id, "approved")}
                                                            className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleTaskAction(task._id, "rejected")}
                                                            className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition"
                                                        >
                                                            Reject
                                                        </button>
                                                        <button
                                                            onClick={() => { setActiveCommentId(task._id); setCommentText(task.adminComment || ""); }}
                                                            className="px-4 py-2 bg-secondary text-secondary-foreground rounded text-sm hover:bg-secondary/90 transition"
                                                        >
                                                            {task.adminComment ? "Edit Comment" : "Add Comment"}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center border-2 border-dashed border-muted rounded-xl text-muted-foreground">
                                        No tasks submitted by user yet.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: STANDUPS */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold flex items-center">
                                <span className="w-2 h-8 bg-primary rounded-full mr-3"></span>
                                Stand-up Reviews
                            </h2>

                            {/* Add Standup Form */}
                            <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                                <h3 className="font-semibold mb-4 text-lg">Add New Review</h3>
                                <form onSubmit={handleAddStandup} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Date</label>
                                            <input
                                                type="date"
                                                value={standupDate}
                                                onChange={(e) => setStandupDate(e.target.value)}
                                                className="w-full p-2 border rounded bg-background"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Status</label>
                                            <select
                                                value={standupStatus}
                                                onChange={(e) => setStandupStatus(e.target.value as any)}
                                                className="w-full p-2 border rounded bg-background"
                                            >
                                                <option value="complete">Complete</option>
                                                <option value="incomplete">Incomplete</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="attended"
                                            checked={standupAttended}
                                            onChange={(e) => setStandupAttended(e.target.checked)}
                                            className="w-4 h-4 text-primary rounded focus:ring-primary"
                                        />
                                        <label htmlFor="attended" className="text-sm font-medium cursor-pointer">
                                            User Attended Stand-up
                                        </label>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Review / Notes</label>
                                        <textarea
                                            value={standupReview}
                                            onChange={(e) => setStandupReview(e.target.value)}
                                            className="w-full p-2 border rounded bg-background h-24"
                                            placeholder="Enter meeting notes or feedback..."
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submittingStandup}
                                        className="w-full py-2 bg-primary text-primary-foreground rounded font-medium hover:bg-primary/90 disabled:opacity-50"
                                    >
                                        {submittingStandup ? "Saving..." : "Save Review"}
                                    </button>
                                </form>
                            </div>

                            {/* Standup List */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg text-muted-foreground">Previous Reviews</h3>
                                {moduleData.standups && moduleData.standups.length > 0 ? (
                                    moduleData.standups.slice().reverse().map((standup) => (
                                        <div key={standup._id} className="bg-card/50 border border-border p-4 rounded-lg">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-medium text-foreground">
                                                    {new Date(standup.date).toLocaleDateString()}
                                                </span>
                                                <div className="flex gap-2">
                                                    <span className={`text-xs px-2 py-1 rounded ${standup.attended ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                        }`}>
                                                        {standup.attended ? "Present" : "Absent"}
                                                    </span>
                                                    <span className={`text-xs px-2 py-1 rounded ${standup.status === 'complete' ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                                                        }`}>
                                                        {standup.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-foreground/80 whitespace-pre-wrap">{standup.review}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground text-sm">No reviews recorded yet.</p>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

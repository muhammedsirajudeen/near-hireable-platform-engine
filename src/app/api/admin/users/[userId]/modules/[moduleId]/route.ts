import dbConnect from "@/lib/db";
import { authenticateRequest } from "@/middleware/auth.middleware";
import UserModule, { IStandup, ITask } from "@/models/UserModule";
import { UserRole } from "@/types/enums/role.enum";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string; moduleId: string }> }) {
   try {
      const payload = await authenticateRequest(req);
      if (payload.role !== UserRole.ADMIN) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      const { userId, moduleId } = await params;
      await dbConnect();

      const userModule = await UserModule.findOne({ userId });

      if (!userModule) {
         return NextResponse.json({ error: "User modules not found" }, { status: 404 });
      }

      const moduleData = userModule.modules.find((m) => m.moduleId === parseInt(moduleId));

      if (!moduleData) {
         return NextResponse.json({ error: "Module not found" }, { status: 404 });
      }

      return NextResponse.json(moduleData);
   } catch (error) {
      console.error("Error fetching module details:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
   }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ userId: string; moduleId: string }> }) {
   try {
      const payload = await authenticateRequest(req);
      if (payload.role !== UserRole.ADMIN) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      const { userId, moduleId } = await params;
      const body = await req.json();
      const { action } = body;

      await dbConnect();
      const userModule = await UserModule.findOne({ userId });

      if (!userModule) {
         return NextResponse.json({ error: "User modules not found" }, { status: 404 });
      }

      const moduleIndex = userModule.modules.findIndex((m) => m.moduleId === parseInt(moduleId));

      if (moduleIndex === -1) {
         return NextResponse.json({ error: "Module not found" }, { status: 404 });
      }

      const targetModule = userModule.modules[moduleIndex];

      if (action === "update_task") {
         const { taskId, status, adminComment } = body;
         // Manual task finding using standard array methods as Mongoose types can be strict
         const taskIndex = targetModule.tasks.findIndex((t: ITask) => t._id?.toString() === taskId);

         if (taskIndex !== -1) {
            if (status) targetModule.tasks[taskIndex].status = status;
            if (adminComment !== undefined) targetModule.tasks[taskIndex].adminComment = adminComment;
         } else {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
         }
      } else if (action === "add_standup") {
         const { date, attended, review, status } = body;
         targetModule.standups.push({
            date: new Date(date),
            attended,
            review,
            status: status || "incomplete",
            createdAt: new Date(),
         });
      } else if (action === "update_standup") {
         const { standupId, review, status, attended } = body;
         const standupIndex = targetModule.standups.findIndex((s: IStandup) => s._id?.toString() === standupId);

         if (standupIndex !== -1) {
            if (review !== undefined) targetModule.standups[standupIndex].review = review;
            if (status !== undefined) targetModule.standups[standupIndex].status = status;
            if (attended !== undefined) targetModule.standups[standupIndex].attended = attended;
         } else {
            return NextResponse.json({ error: "Standup not found" }, { status: 404 });
         }
      } else if (action === "update_module_status") {
         const { status } = body;
         // Validate status enum if possible, or trust strict typing from frontend + mongoose validation
         if (["locked", "unlocked", "completed"].includes(status)) {
            targetModule.status = status;
         } else {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
         }
      } else {
         return NextResponse.json({ error: "Invalid action" }, { status: 400 });
      }

      await userModule.save();

      return NextResponse.json(targetModule);
   } catch (error) {
      console.error("Error updating module:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
   }
}

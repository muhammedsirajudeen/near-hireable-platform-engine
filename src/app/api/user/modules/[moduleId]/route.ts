import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/middleware/auth.middleware";
import dbConnect from "@/lib/db";
import UserModule from "@/models/UserModule";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ moduleId: string }> }
) {
    try {
        const payload = await authenticateRequest(req);
        // authenticateRequest throws if invalid, so no need to check explicitly here usually, but try/catch handles it.

        const { moduleId } = await params;
        await dbConnect();

        const userModule = await UserModule.findOne({ userId: payload.userId });

        if (!userModule) {
            return NextResponse.json(
                { error: "User modules not found" },
                { status: 404 }
            );
        }

        const moduleData = userModule.modules.find(
            (m) => m.moduleId === parseInt(moduleId)
        );

        if (!moduleData) {
            return NextResponse.json(
                { error: "Module not found" },
                { status: 404 }
            );
        }

        const moduleObj = JSON.parse(JSON.stringify(moduleData));
        return NextResponse.json({ ...moduleObj, userId: payload.userId });
    } catch (error) {
        console.error("Error fetching module:", error);
        return NextResponse.json(
            { error: "Unauthorized or Internal Error" },
            { status: 401 }
        );
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ moduleId: string }> }
) {
    try {
        const payload = await authenticateRequest(req);

        const { moduleId } = await params;
        const { content } = await req.json();

        if (!content) {
            return NextResponse.json(
                { error: "Task content is required" },
                { status: 400 }
            );
        }

        await dbConnect();

        const userModule = await UserModule.findOne({ userId: payload.userId });
        if (!userModule) {
            return NextResponse.json(
                { error: "User modules not found" },
                { status: 404 }
            );
        }

        const moduleIndex = userModule.modules.findIndex(
            (m) => m.moduleId === parseInt(moduleId)
        );

        if (moduleIndex === -1) {
            return NextResponse.json(
                { error: "Module not found" },
                { status: 404 }
            );
        }

        userModule.modules[moduleIndex].tasks.push({
            content,
            status: "pending",
            createdAt: new Date(),
        });

        await userModule.save();

        // Get the last added task to return
        const updatedModule = userModule.modules[moduleIndex];
        const addedTask = updatedModule.tasks[updatedModule.tasks.length - 1];

        return NextResponse.json(
            { message: "Task added successfully", task: addedTask },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error adding task:", error);
        return NextResponse.json(
            { error: "Unauthorized or Internal Error" },
            { status: 500 }
        );
    }
}

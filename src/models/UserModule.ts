import mongoose, { Document, Model, models, Schema } from "mongoose";

export interface ITask {
    content: string;
    status: "pending" | "approved" | "rejected";
    adminComment?: string;
    createdAt: Date;
    _id?: mongoose.Types.ObjectId;
}

export interface IStandup {
    date: Date;
    attended: boolean;
    status: "complete" | "incomplete";
    review?: string;
    createdAt: Date;
    _id?: mongoose.Types.ObjectId;
}

export enum ModuleStatus {
    LOCKED = "locked",
    UNLOCKED = "unlocked",
    COMPLETED = "completed",
}

export interface IModule {
    moduleId: number;
    status: ModuleStatus;
    tasks: ITask[];
    standups: IStandup[];
}

export interface IUserModuleDocument extends Document {
    userId: mongoose.Types.ObjectId;
    modules: IModule[];
    createdAt: Date;
    updatedAt: Date;
}

const UserModuleSchema = new Schema<IUserModuleDocument>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        modules: [
            {
                moduleId: { type: Number, required: true },
                status: {
                    type: String,
                    enum: Object.values(ModuleStatus),
                    default: ModuleStatus.LOCKED,
                },
                tasks: [
                    {
                        content: { type: String, required: true },
                        status: {
                            type: String,
                            enum: ["pending", "approved", "rejected"],
                            default: "pending",
                        },
                        adminComment: { type: String },
                        createdAt: { type: Date, default: Date.now },
                    },
                ],
                standups: [
                    {
                        date: { type: Date, required: true },
                        attended: { type: Boolean, required: true },
                        status: {
                            type: String,
                            enum: ["complete", "incomplete"],
                            default: "incomplete",
                        },
                        review: { type: String },
                        createdAt: { type: Date, default: Date.now },
                    },
                ],
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Prevent model recompilation during development
const UserModule: Model<IUserModuleDocument> =
    models.UserModule || mongoose.model<IUserModuleDocument>("UserModule", UserModuleSchema);

export default UserModule;

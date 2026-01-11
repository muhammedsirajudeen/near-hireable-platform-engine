import mongoose, { Document, Model, models, Schema } from "mongoose";

export enum PRDStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
}

export interface IAdminNote {
    id: string;
    content: string;
    createdAt: Date;
    createdBy: mongoose.Types.ObjectId;
}

export interface IPRDDocument extends Document {
    userId: mongoose.Types.ObjectId;
    problemStatement: string;
    targetUsers: string;
    keyFeatures: string;
    successMetrics?: string;
    timeline?: string;
    additionalNotes?: string;
    status: PRDStatus;
    adminNotes: IAdminNote[];
    submittedAt: Date;
    approvedAt?: Date;
    rejectedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const PRDSchema = new Schema<IPRDDocument>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, // One PRD per user
        },
        problemStatement: {
            type: String,
            required: [true, "Problem statement is required"],
            maxlength: [2000, "Problem statement cannot exceed 2000 characters"],
        },
        targetUsers: {
            type: String,
            required: [true, "Target users are required"],
            maxlength: [500, "Target users cannot exceed 500 characters"],
        },
        keyFeatures: {
            type: String,
            required: [true, "Key features are required"],
            maxlength: [2000, "Key features cannot exceed 2000 characters"],
        },
        successMetrics: {
            type: String,
            maxlength: [1000, "Success metrics cannot exceed 1000 characters"],
        },
        timeline: {
            type: String,
            maxlength: [500, "Timeline cannot exceed 500 characters"],
        },
        additionalNotes: {
            type: String,
            maxlength: [1000, "Additional notes cannot exceed 1000 characters"],
        },
        status: {
            type: String,
            enum: Object.values(PRDStatus),
            default: PRDStatus.PENDING,
        },
        adminNotes: [{
            id: { type: String, required: true },
            content: { type: String, required: true, maxlength: 500 },
            createdAt: { type: Date, default: Date.now },
            createdBy: { type: Schema.Types.ObjectId, ref: "User" },
        }],
        submittedAt: {
            type: Date,
            default: Date.now,
        },
        approvedAt: {
            type: Date,
        },
        rejectedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
PRDSchema.index({ userId: 1 });
PRDSchema.index({ status: 1 });

const PRD: Model<IPRDDocument> = models.PRD || mongoose.model<IPRDDocument>("PRD", PRDSchema);

export default PRD;

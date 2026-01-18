// models/PushSubscription.ts
import { Document, Schema, model, models } from "mongoose";

export interface IPushSubscriptionDocument extends Document {
   endpoint: string;
   keys: {
      p256dh: string;
      auth: string;
   };
   userId?: string;
   userAgent?: string; // To identify different devices
   expirationTime?: number | null; // Subscription expiration time
   isActive: boolean; // For soft deletion
   createdAt: Date;
   updatedAt: Date;
}

// Type for lean queries (without Mongoose Document methods)
export type PushSubscriptionLean = {
   endpoint: string;
   keys: {
      p256dh: string;
      auth: string;
   };
   userId?: string;
   userAgent?: string;
   expirationTime?: number | null;
   isActive: boolean;
   createdAt: Date;
   updatedAt: Date;
};

const PushSubscriptionSchema = new Schema(
   {
      endpoint: { type: String, required: true },
      keys: {
         p256dh: { type: String, required: true },
         auth: { type: String, required: true },
      },
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      userAgent: { type: String },
      expirationTime: { type: Number, default: null },
      isActive: { type: Boolean, default: true },
   },
   {
      timestamps: true,
   }
);

// Indexes for efficient queries
PushSubscriptionSchema.index({ endpoint: 1 }, { unique: true }); // Each endpoint can only exist once
PushSubscriptionSchema.index({ userId: 1, isActive: 1 }); // Efficiently query all active subscriptions for a user
PushSubscriptionSchema.index({ isActive: 1 }); // For cleanup queries

export const PushSubscription = models.PushSubscription || model("PushSubscription", PushSubscriptionSchema);

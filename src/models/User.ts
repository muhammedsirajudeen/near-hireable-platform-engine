import { UserRole } from "@/types/enums/role.enum";
import mongoose, { Document, Model, models, Schema } from "mongoose";

export interface IUserDocument extends Document {
   name: string;
   email: string;
   password?: string;
   role: UserRole;
   prdStatus?: "none" | "pending" | "approved";
   createdAt: Date;
   updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
   {
      name: {
         type: String,
         required: [true, "Please provide a name"],
         maxlength: [60, "Name cannot be more than 60 characters"],
      },
      email: {
         type: String,
         required: [true, "Please provide an email"],
         unique: true,
         lowercase: true,
         trim: true,
      },
      password: {
         type: String,
         select: false, // Don't return password by default
      },
      role: {
         type: String,
         enum: Object.values(UserRole),
         default: UserRole.USER,
      },
      prdStatus: {
         type: String,
         enum: ["none", "pending", "approved"],
         default: "none",
      },
   },
   {
      timestamps: true,
   }
);

// Prevent model recompilation during development
const User: Model<IUserDocument> = models.User || mongoose.model<IUserDocument>("User", UserSchema);

export default User;

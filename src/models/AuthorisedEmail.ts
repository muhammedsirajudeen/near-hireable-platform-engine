import mongoose, { Document, Model, models, Schema } from "mongoose";

export interface IAuthorisedDocument extends Document {
   email: string;
   createdAt: Date;
   updatedAt: Date;
}

const AuthorisedEmailSchema = new Schema<IAuthorisedDocument>(
   {
      email: {
         type: String,
         required: [true, "Please provide an email"],
         unique: true,
         lowercase: true,
         trim: true,
      },
   },
   {
      timestamps: true,
   }
);

// Prevent model recompilation during development
const AuthorisedEmail: Model<IAuthorisedDocument> = models.AuthorisedEmail || mongoose.model<IAuthorisedDocument>("AuthorisedEmail", AuthorisedEmailSchema);

export default AuthorisedEmail;

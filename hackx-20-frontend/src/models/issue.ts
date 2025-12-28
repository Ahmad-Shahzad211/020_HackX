import { IssueType } from "@/types/mongoTypes";
import mongoose, { Schema, Model } from "mongoose";

// Define the schema
const issueSchema = new Schema<IssueType>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      enum: ["feedback", "issue", "bug", "suggestion"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Completed"],
      default: "Pending",
    },
    remarks: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Export the model
const Issues: Model<IssueType> =
  mongoose.models.Issues || mongoose.model<IssueType>("Issues", issueSchema);

export default Issues;

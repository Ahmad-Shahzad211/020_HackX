import { FeedbackType } from "@/types/mongoTypes";
import mongoose, { Schema, Model } from "mongoose";

// Define the schema
const feedbackSchema = new Schema<FeedbackType>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["feedback", "issue", "bug", "suggestion"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Completed"],
      required: true,
      default: "Pending",
    },
    remarks: {
      type: "String",
      required: false,
    },
    details: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Export the model
const Feedback: Model<FeedbackType> =
  mongoose.models.Feedback ||
  mongoose.model<FeedbackType>("Feedback", feedbackSchema);

export default Feedback;

import { HydratedDocument, Types } from "mongoose";

export interface UserType {
  fullName: string;
  gender: string;
  email: string;
  password: string;
  role: "admin" | "user";
  otp: number;
  lastLogin: Date;
  otpCreationTime: Date;
  plan: string;
  planExpiration: Date;
  isVerified: boolean;
  country: string;
  createdAt: Date;
  updatedAt: Date;
  loginType: "email" | "google";
  googleId?: string;
  avatarUrl: string | null;

  userDeviceAndLocationInfo: Array<{
    ipAddress: string;
    location: {
      country: string;
      city: string;
    };
    deviceInfo: {
      browser: string;
      browserVersion: string;
      osName: string;
    };
    lastActive?: Date;
  }>;
}
export interface FeedbackType {
  userId: Types.ObjectId;
  type: "feedback" | "issue" | "bug" | "suggestion";
  details: string;
  status: "Pending" | "Reviewed" | "Completed";
  remarks?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type FeedbackDocument = HydratedDocument<FeedbackType>;
export interface IssueType {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  subject: "feedback" | "issue" | "bug" | "suggestion";
  message: string;
  status: "Pending" | "Reviewed" | "Completed";
  remarks: string;
  createdAt: Date;
  updatedAt: Date;
}

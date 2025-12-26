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
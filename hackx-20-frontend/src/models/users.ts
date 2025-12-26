import { UserType } from "@/types/mongoTypes";
import mongoose, { Schema, Model } from "mongoose";

// Define the schema
const userSchema = new Schema<UserType>(
  {
    fullName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 50,
    },
    gender: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/, "Invalid email"],
    },
    password: {
      type: String,
      required: function (this: any) {
        return this.loginType === "email";
      },
      validate: {
        validator: function (this: any, value: string): boolean {
          if (this.loginType === "email") {
            return typeof value === "string" && value.length >= 8;
          }
          return true;
        },
        message: "Password must be at least 8 characters for email users",
      },
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
      required: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    otp: {
      type: Number,
      required: function (this: any) {
        return this.loginType === "email" && !this.isVerified;
      },
      default: 0,
    },
    otpCreationTime: {
      type: Date,
      required: function (this: any) {
        return this.loginType === "email" && !this.isVerified;
      },
      default: Date.now,
      index: { expires: "30m" }, // OTP expires in 30 minutes
    },
    plan: {
      type: String,
      default: "free",
    },
    planExpiration: {
      type: Date,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    loginType: {
      type: String,
      enum: ["email", "google"],
      default: "email",
      required: true,
    },
    googleId: {
      type: String,
      required: false,
    },

    userDeviceAndLocationInfo: {
      type: [
        {
          ipAddress: { type: String, required: true },
          location: {
            country: { type: String, required: true },
            city: { type: String, required: true },
          },
          deviceInfo: {
            browser: { type: String, required: true },
            browserVersion: { type: String, required: true },
            osName: { type: String, required: true },
          },
          lastActive: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    avatarUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Export the model
const User: Model<UserType> =
  mongoose.models.User || mongoose.model<UserType>("User", userSchema);

export default User;

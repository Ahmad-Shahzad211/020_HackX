import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/models/users";
import dbConnect from "@/db/dbClient";
import { generateOTP, sendVerificationEmail } from "@/utils/func";

export async function POST(request: NextRequest) {
  try {
    // Ensure database connection
    await dbConnect();

    // Parse request data
    const data = await request.json();

    // Find user by email
    const user = await User.findOne({ email: data.email }).select("+password");

    if (!user) {
      return NextResponse.json(
        { message: "User not found", status: 404 },
        { status: 404 }
      );
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid credentials", status: 401 },
        { status: 401 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { message: "Please verify your email", status: 403 },
        { status: 403 }
      );
    }

    // Ensure userDeviceAndLocationInfo exists and is an array
    if (!Array.isArray(user.userDeviceAndLocationInfo)) {
      user.userDeviceAndLocationInfo = [];
    }

    if (user.userDeviceAndLocationInfo.length == 3) {
      const newOTP = await generateOTP();

      await sendVerificationEmail(
        data.email,
        newOTP,
        process.env.ADMIN_EMAIL,
        process.env.ADMIN_PASSWORD
      );

      await User.updateOne(
        { email: data.email },
        { $set: { otp: newOTP, otpCreationTime: new Date() } }
      );
      return NextResponse.json(
        { message: "Please verify using OTP!", requireOTP: true, status: 403 },
        { status: 403 }
      );
    }
    // Check if this IP + device combo already exists
    const exists = user.userDeviceAndLocationInfo.some(
      (entry) =>
        entry.ipAddress === data.ipAddress &&
        entry.deviceInfo.browser === data.browser &&
        entry.deviceInfo.browserVersion === data.browserVersion &&
        entry.deviceInfo.osName === data.osName
    );

    if (!exists) {
      const newEntry = {
        ipAddress: data.ipAddress,
        location: {
          country: data.country,
          city: data.city,
        },
        deviceInfo: {
          browser: data.browser,
          browserVersion: data.browserVersion,
          osName: data.osName,
        },
      };

      await User.updateOne(
        { _id: user._id },

        { $push: { userDeviceAndLocationInfo: newEntry } }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.fullName,
      },
      process.env.JWT_SECRET as string,
      {
        algorithm: "HS256",
        expiresIn: "7d",
      }
    );
    return NextResponse.json(
      {
        message: "Success! Logged In. Redirecting you in a moment...",
        fullName: user.fullName,
        jwtToken: token,
        status: 200,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: `An error occurred during login: ${error.message}`,
        status: 500,
      },
      { status: 500 }
    );
  }
}

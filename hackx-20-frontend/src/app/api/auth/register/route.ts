import dbConnect from "@/db/dbClient";
import User from "@/models/users";
import { generateOTP, sendVerificationEmail } from "@/utils/func";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const data = await request.json();

    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already Exists!", success: false },
        { status: 409 }
      );
    }

    // Validate environment variables
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      throw new Error("ADMIN_EMAIL or ADMIN_PASSWORD environment variable is not defined");
    }

    // Hash password and generate OTP
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const generatedOTP = await generateOTP();
    
    // Send verification email
    await sendVerificationEmail(
      data.email,
      generatedOTP,
      process.env.ADMIN_EMAIL,
      process.env.ADMIN_PASSWORD
    );

    // Create new user
    const user = new User({
      fullName: data.fullName,
      gender: data.gender,
      email: data.email,
      password: hashedPassword,
      otp: generatedOTP,
      otpCreationTime: new Date(),
      userDeviceAndLocationInfo: [
        {
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
          lastActive: new Date(),
        },
      ],
    });

    // Save user to database
    await user.save();

    return NextResponse.json(
      {
        message:
          "Success! We have sent you an OTP, please check your email. Redirecting you to the OTP page.",
        success: true,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { 
        message: error.message || "An error occurred during registration",
        success: false 
      },
      { status: error.status || 500 }
    );
  }
}

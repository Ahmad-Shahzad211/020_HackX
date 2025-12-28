import dbConnect from "@/db/dbClient";
import User from "@/models/users";
import { generateOTP, sendVerificationEmail } from "@/utils/func";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const data = await request.json();

    try {
      const existingUser = await User.findOne({ email: data.email });
      if (existingUser) {
        return NextResponse.json(
          { message: "User already Exists!", success: false },
          { status: 409 }
        );
      }
      if (!process.env.ADMIN_EMAIL) {
        throw new Error("ADMIN_EMAIL environment variable is not defined");
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const generatedOTP = await generateOTP();
      await sendVerificationEmail(
        data.email,
        generatedOTP,
        process.env.ADMIN_EMAIL,
        process.env.ADMIN_PASSWORD
      );
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
            lastActive: new Date(), // optional, defaults to now
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await user.validate();
      await user.validate();
      await user.save();
    } catch (error: any) {
      return NextResponse.json(
        { error, success: false },
        { status: error.status }
      );
    }

    return NextResponse.json(
      {
        message:
          "Success! We have sent you an OTP, please check your email. Redirecting you to the OTP page.",
        success: true,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error, success: false },
      { status: error.status }
    );
  }
}

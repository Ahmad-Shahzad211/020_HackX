import dbConnect from "@/db/dbClient";
import User from "@/models/users";
import { generateOTP, sendVerificationEmail } from "@/utils/func";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    await dbConnect();
    const { email } = data;
    if (!email) {
      return NextResponse.json(
        { message: "Email is required.", success: false },
        { status: 400 }
      );
    }
    const user = await User.findOne({ email }).select("otp");
    if (!user) {
      return NextResponse.json(
        { message: "User not found.", success: false },
        { status: 404 }
      );
    }
    const newOTP = await generateOTP();
    await User.updateOne(
      { email },
      { $set: { otp: newOTP, otpCreationTime: new Date() } }
    );
    await sendVerificationEmail(
      email,
      newOTP,
      process.env.ADMIN_EMAIL,
      process.env.ADMIN_PASSWORD
    );
    return NextResponse.json(
      { message: "Success! OTP sent successfully!", success: true },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: `An error occurred while processing your request. ${error}`,
        success: false,
      },
      { status: 500 }
    );
  }
}

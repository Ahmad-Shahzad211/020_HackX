import dbConnect from "@/db/dbClient";
import User from "@/models/users";
import { generateOTP, sendVerificationEmail } from "@/utils/func";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();

    // CASE 1: Normal OTP verification
    if (data.otp && !data.verifyOTP) {
      const user = await User.findOne({ email: data.email }).select("otp");

      if (user?.otp == data.otp) {
        await User.updateOne(
          { email: data.email },
          {
            $set: {
              otp: null,
              isVerified: true,
              otpCreationTime: null,
            },
          }
        );

        return NextResponse.json(
          { message: "Success! OTP verified successfully!", success: true },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { message: "Invalid OTP!", success: false },
          { status: 401 }
        );
      }
    }

    // CASE 2: OTP verification after device limit (verifyOTP)
    else if (data.verifyOTP) {
      const user = await User.findOne({ email: data.email }).select(
        "otp userDeviceAndLocationInfo"
      );

      if (user && user.otp == data.otp) {
        // If user has 3 devices, remove least recently used one

        if (user.userDeviceAndLocationInfo.length == 3) {
          const lruIndex = user.userDeviceAndLocationInfo.reduce(
            (oldestIdx, current, idx, arr) => {
              return new Date(current.lastActive ?? 0) <
                new Date(arr[oldestIdx].lastActive ?? 0)
                ? idx
                : oldestIdx;
            },
            0
          );

          user.userDeviceAndLocationInfo.splice(lruIndex, 1);
        }

        user.otp = 0;
        user.otpCreationTime = new Date();
        user.isVerified = true;

        await user.save();

        return NextResponse.json(
          { message: "Success! OTP verified successfully!", success: true },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { message: "Invalid OTP!", success: false },
          { status: 401 }
        );
      }
    }

    // CASE 3: Send OTP (initial request)
    else {
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
        { message: "Success! OTP sent successfully!", success: true },
        { status: 200 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        message: `Error! An error occurred while processing your request. ${error}`,
        success: false,
      },
      { status: 500 }
    );
  }
}

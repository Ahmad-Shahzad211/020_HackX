import dbConnect from "@/db/dbClient";
import User from "@/models/users";
import { decodingJWT } from "@/utils/func";
import bcrypt from "bcryptjs";
import { JwtPayload } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    if (data.email) {
      if (!data.password) {
        return NextResponse.json(
          { message: "Password is required.", success: false, status: 400 },
          { status: 400 }
        );
      }
      const user = await User.findOne({ email: data.email });
      if (!user) {
        return NextResponse.json(
          { message: "User not found.", success: false, status: 404 },
          { status: 404 }
        );
      }
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const updatedUser = await User.updateOne(
        { email: data.email },
        { $set: { password: hashedPassword } }
      );
      if (updatedUser.modifiedCount === 0) {
        return NextResponse.json(
          {
            message: "Failed to update password.",
            success: false,
            status: 500,
          },
          { status: 500 }
        );
      }
      return NextResponse.json(
        {
          message:
            "Success! Password updated successfully! Please login with new password. Redirecting you now...",
          success: true,
          status: 200,
        },
        { status: 200 }
      );
    } else {
      const token = request.headers.get("Authorization")?.split(" ")[1];

      if (!token) {
        return NextResponse.json(
          {
            message: "Authorization token is required.",
            success: false,
            status: 401,
          },
          { status: 401 }
        );
      }
      const decodedToken = (await decodingJWT(token)) as JwtPayload;

      const user = await User.findById(decodedToken.id).select("+password");

      if (!user) {
        return NextResponse.json(
          { message: "Error! User not found.", success: false, status: 404 },
          { status: 404 }
        );
      }

      const verified = await bcrypt.compare(
        data.currentPassword,
        user.password
      );

      if (!verified) {
        return NextResponse.json(
          {
            message: "Error! Incorrect password.",
            success: false,
            status: 401,
          },
          { status: 401 }
        );
      }

      const hashedPassword = await bcrypt.hash(data.newPassword, 10);
      const updatedUser = await User.updateOne(
        { _id: user._id },
        { $set: { password: hashedPassword } }
      );
      if (updatedUser.modifiedCount === 0) {
        return NextResponse.json(
          {
            message: "Error! Failed to update password.",
            success: false,
            status: 500,
          },
          { status: 500 }
        );
      }
      return NextResponse.json(
        {
          message:
            "Success! Password updated successfully! Please login with new password. Redirecting you now...",
          success: true,
          status: 200,
        },
        { status: 200 }
      );
    }
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

import dbConnect from "@/db/dbClient";
import User from "@/models/users";
import { decodingJWT } from "@/utils/func";
import { JwtPayload } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const token = request.headers.get("Authorization")?.split(" ")[1];

    if (token == null) {
      return NextResponse.json(
        { message: "Authentication Failed" },
        { status: 401 }
      );
    }
    const userToken = (await decodingJWT(token)) as JwtPayload;

    const user = await User.findById({ _id: userToken.id })
      .select("-password -otp -otpCreationTime")
      .findOne();

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(error, { status: error.status });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();

    const token = request.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { message: "Error! Authentication Failed", status: 401 },
        { status: 401 }
      );
    }

    const userToken = (await decodingJWT(token)) as JwtPayload;
    const user = await User.findById(userToken.id);

    if (!user) {
      return NextResponse.json(
        { message: "Error! User not found", status: 404 },
        { status: 404 }
      );
    }
    const data = await request.json();

    const updateFields: any = {};

    if (data.fullName) {
      updateFields.fullName = data.fullName;
    }

    if (data.avatarUrl) {
      updateFields.avatarUrl = data.avatarUrl;
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { message: "No valid fields to update" },
        { status: 400 }
      );
    }

    await User.findByIdAndUpdate(
      user._id, // or `user._id` if you're extracting from token/session
      { $set: updateFields },
      { new: true }
    );

    return NextResponse.json(
      { message: "Success! User updated", status: 200 },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

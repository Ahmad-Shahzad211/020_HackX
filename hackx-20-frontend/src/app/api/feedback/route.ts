import dbConnect from "@/db/dbClient";
import Feedback from "@/models/feedback";
import User from "@/models/users";
import { decodingJWT } from "@/utils/func";
import { JwtPayload } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    const token = await request.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        {
          message: "Error! Unauthorized access!",
          status: 401,
        },
        { status: 401 }
      );
    }
    const decodedToken = (await decodingJWT(token)) as JwtPayload;

    if (!decodedToken) {
      return NextResponse.json(
        {
          message: "Error! Unauthorized access!",
          status: 401,
        },
        { status: 401 }
      );
    }
    const user = await User.findById({ _id: decodedToken.id });
    if (!user) {
      return NextResponse.json(
        {
          message: "Error! User not found",
          status: 404,
        },
        { status: 404 }
      );
    }
    const feedbackExists = await Feedback.findOne({ userId: user._id });
    if (
      feedbackExists &&
      (feedbackExists.status == "Pending" ||
        feedbackExists.status == "Reviewed")
    ) {
      return NextResponse.json(
        {
          message: "Your feedback is already in progress!",
          status: 409,
        },
        { status: 409 }
      );
    }
    const newFeedback = await Feedback.create({
      userId: user._id,
      type: data.type,
      details: data.details,
      status: "Pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await newFeedback.validate();
    await newFeedback.save();
    return NextResponse.json(
      {
        message: "Your feedback is noted! We'll get back to you soon.",
        status: 200,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(error, { status: error.status });
  }
}

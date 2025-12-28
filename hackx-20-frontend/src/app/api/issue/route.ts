import dbConnect from "@/db/dbClient";
import Issues from "@/models/issue";
import { IssueType } from "@/types/mongoTypes";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data: IssueType = await request.json();

    const newIssue = new Issues({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      subject: data.subject,
      message: data.message,
      status: "Pending",
      remarks: data.remarks || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newIssue.save();

    return NextResponse.json(
      {
        message: `Success! Your ${data.subject} is noted! We'll get back to you soon.`,
        status: 200,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error! Creating feedback:", error);
    return NextResponse.json(
      {
        error:
          error.message ||
          "Error! Something went wrong while submitting feedback.",
      },
      { status: 500 }
    );
  }
}

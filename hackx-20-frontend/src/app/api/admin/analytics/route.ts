import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/db/dbClient";

// Middleware to verify admin
function verifyAdmin(request: NextRequest) {
  const token = request.headers.get("authorization")?.split(" ")[1];
  
  if (!token) {
    return null;
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    if (decoded.role !== "admin") {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

// GET - Get analytics data
export async function GET(request: NextRequest) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required", status: 403 },
        { status: 403 }
      );
    }

    await dbConnect();

    // Here you can add more analytics as needed
    // For now, returning basic structure
    const analytics = {
      totalUsers: 0,
      totalDocuments: 0,
      activeUsers: 0,
    };

    return NextResponse.json(
      {
        message: "Analytics fetched successfully",
        analytics,
        status: 200,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: `An error occurred: ${error.message}`,
        status: 500,
      },
      { status: 500 }
    );
  }
}

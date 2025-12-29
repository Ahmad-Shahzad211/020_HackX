import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/models/users";
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

// GET - Get all users
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

    const users = await User.find({}).select(
      "fullName email role plan lastLogin createdAt"
    );

    return NextResponse.json(
      {
        message: "Users fetched successfully",
        users,
        totalUsers: users.length,
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

// DELETE - Delete a user
export async function DELETE(request: NextRequest) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required", status: 403 },
        { status: 403 }
      );
    }

    await dbConnect();

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required", status: 400 },
        { status: 400 }
      );
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return NextResponse.json(
        { message: "User not found", status: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "User deleted successfully",
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

// PATCH - Update user role
export async function PATCH(request: NextRequest) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required", status: 403 },
        { status: 403 }
      );
    }

    await dbConnect();

    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json(
        { message: "User ID and role are required", status: 400 },
        { status: 400 }
      );
    }

    if (role !== "admin" && role !== "user") {
      return NextResponse.json(
        { message: "Invalid role. Must be 'admin' or 'user'", status: 400 },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("fullName email role");

    if (!updatedUser) {
      return NextResponse.json(
        { message: "User not found", status: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: `User role updated to ${role} successfully`,
        user: updatedUser,
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

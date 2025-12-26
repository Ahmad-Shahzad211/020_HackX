import dbConnect from "@/db/dbClient";
import User from "@/models/users";
import { decodingJWT } from "@/utils/func";
import { NextRequest, NextResponse, after } from "next/server";
import { JwtPayload } from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const data = await request.json();
    let token = request.headers.get("Authorization")?.split(" ")[1];

    // fallback: get token from cookie if not in header
    if (!token) {
      token = request.cookies.get("__chatLegis__")?.value;
    }

    if (!token) {
      return NextResponse.json(
        { message: "No authentication token found" },
        { status: 401 }
      );
    }

    const decoded = (await decodingJWT(token)) as JwtPayload;
    const user = await User.findById(decoded.id);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Create response early (don’t block for DB operation)
    const response = NextResponse.json(
      { message: "User Logged Out Successfully!" },
      { status: 200 }
    );

    // Expire cookie
    response.cookies.set("__chatLegis__", "", { maxAge: 0 });

    // Run device removal in the background
    after(async () => {
      try {
        await User.updateOne(
          { _id: user._id },
          {
            $pull: {
              userDeviceAndLocationInfo: {
                ipAddress: data.ipAddress,
              },
            },
          }
        );
      } catch (err) {
        console.error("Error removing device after logout:", err);
      }
    });

    return response;
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { message: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

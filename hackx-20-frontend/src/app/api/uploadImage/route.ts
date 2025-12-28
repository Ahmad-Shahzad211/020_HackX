import dbConnect from "@/db/dbClient";
import User from "@/models/users";
import { decodingJWT } from "@/utils/func";
import { JwtPayload } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { message: "Error! Authentication Failed", status: 401 },
        { status: 401 }
      );
    }

    const userToken = (await decodingJWT(token)) as JwtPayload;
    await dbConnect();
    const user = await User.findById(userToken.id);
    if (!user) {
      return NextResponse.json(
        { message: "Error! User not found", status: 404 },
        { status: 404 }
      );
    }
    const cloudinaryToken = process.env.CLOUDINARY_TOKEN;

    const data = await request.formData();

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryToken}/upload`,
      {
        method: "POST",
        body: data,
      }
    );

    if (!response.ok) {
      return NextResponse.json({
        message: response.text(),
        status: response.status,
      });
    }

    const resp = await response.json();

    return NextResponse.json({ resp }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: error.status,
      }
    );
  }
}

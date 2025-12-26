import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/models/users";
import dbConnect from "@/db/dbClient";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error || !code) {
      return NextResponse.redirect(
        new URL("/auth/login?error=google_auth_failed", request.url)
      );
    }

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID as string,
        client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
        code,
        grant_type: "authorization_code",
        redirect_uri:
          process.env.GOOGLE_REDIRECT_URI ||
          `${new URL(request.url).origin}/api/auth/google/callback`,
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokens.access_token) {
      return NextResponse.redirect(
        new URL("/auth/login?error=token_exchange_failed", request.url)
      );
    }

    // Get user profile
    const profileResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    const profile = await profileResponse.json();

    if (!profile.email) {
      return NextResponse.redirect(
        new URL("/auth/login?error=no_email_provided", request.url)
      );
    }

    // Check if user already exists with this email
    const existingUser = await User.findOne({ email: profile.email });

    let user;

    if (existingUser) {
      // User already exists - update with Google information if needed
      user = existingUser;

      // Update Google-specific fields
      const updateFields: any = {
        googleId: profile.id,
        isVerified: true, // Ensure user is verified when logging in with Google
      };

      // Only update avatarUrl if user doesn't have one already
      if (!user.avatarUrl && profile.picture) {
        updateFields.avatarUrl = profile.picture;
      }

      // Update the user with Google information
      await User.updateOne({ _id: user._id }, { $set: updateFields });

      // Refresh user data to get updated information
      user = await User.findById(user._id);
    } else {
      // Create new user
      user = new User({
        fullName:
          profile.name || `${profile.given_name} ${profile.family_name}`,
        email: profile.email,
        gender: "male", // Default as requested
        password: "", // Empty for Google users
        loginType: "google",
        googleId: profile.id,
        avatarUrl: profile.picture || null,
        isVerified: true, // Google users are automatically verified
        otp: null, // Not needed for Google users
        otpCreationTime: null, // Not needed for Google users
      });

      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user!._id,
        email: user!.email,
        username: user!.fullName,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    // Create response with redirect
    const response = NextResponse.redirect(
      new URL("/cl/chatscreen", request.url)
    );

    // Set the JWT cookie with minimal attributes to match email login behavior
    response.cookies.set("__chatLegis__", token, {
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Google callback error:", error);
    return NextResponse.redirect(
      new URL("/auth/login?error=authentication_failed", request.url)
    );
  }
}

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "@/models/users";
import dbConnect from "@/db/dbClient";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        await dbConnect();

        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("No email found in Google profile"), undefined);
        }

        // Check if user already exists with this email but different login type
        const existingUser = await User.findOne({ email });

        if (existingUser && existingUser.loginType === "email") {
          return done(
            new Error("User already registered with email/password"),
            undefined
          );
        }

        // Check if user already exists with Google
        if (existingUser && existingUser.loginType === "google") {
          return done(null, existingUser);
        }

        // Create new user
        const newUser = new User({
          fullName:
            profile.displayName ||
            `${profile.name?.givenName} ${profile.name?.familyName}`,
          email,
          gender: "male", // Default as requested
          password: "", // Empty for Google users
          loginType: "google",
          googleId: profile.id,
          isVerified: true, // Google users are automatically verified
          otp: 0, // Not needed for Google users
          otpCreationTime: new Date(), // Required field
        });

        await newUser.save();
        return done(null, newUser);
      } catch (error) {
        return done(error, undefined);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    await dbConnect();
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;

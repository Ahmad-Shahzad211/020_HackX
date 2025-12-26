import mongoose from "mongoose";

// Connect to MongoDB
const mongodbURI = process.env.MONGODB_URI as string;

if (!mongodbURI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env"
  );
}

export default async function dbConnect() {
  try {
    return mongoose.connect(mongodbURI, {
      bufferCommands: false,
      dbName: "hackx-chatLegis",
    });
  } catch (error) {
    throw error;
  }
}

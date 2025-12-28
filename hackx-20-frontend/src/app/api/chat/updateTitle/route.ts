import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

// Chatbots server URL
const apiUrl =
  process.env.NODE_ENV === "development"
    ? process.env.DEVELOPMENT_CHATBOT_URL
    : process.env.PRODUCTION_CHATBOT_URL;

export async function POST(req: NextRequest) {
  try {
    const { conversationId, title } = await req.json();
    
    if (!conversationId || !title) {
      return NextResponse.json(
        { message: "Conversation ID and title are required" },
        { status: 400 }
      );
    }

    // Get the auth token from the request headers
    const token = req.headers.get("Authorization")?.split(" ")[1];
    
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Call the backend API to update the chat title
    const response = await fetch(
      `${apiUrl}/api/v1/chatlegis/update-title`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          title: title,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.detail?.message || "Failed to update chat title" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      message: "Chat title updated successfully",
      chat: data,
    });
  } catch (error) {
    console.error("Error updating chat title:", error);
    return NextResponse.json(
      { message: "An error occurred while updating chat title" },
      { status: 500 }
    );
  }
}

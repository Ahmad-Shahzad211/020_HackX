import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // this is for the chatbot api request timeout; It is because we are on the free plan of vercel.

// Chatbots server URL
const apiUrl =
  process.env.NODE_ENV === "development"
    ? process.env.DEVELOPMENT_CHATBOT_URL
    : process.env.PRODUCTION_CHATBOT_URL;

export async function GET(request: NextRequest) {
  try {
    const conversation_id = request.nextUrl.searchParams.get("conversation_id");
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const chatbotDat = await fetch(
      `${apiUrl}/api/v1/chatlegis/history/${conversation_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const chatbotData = await chatbotDat.json();

    if (chatbotData.detail != undefined && chatbotData.detail.status === 401) {
      return NextResponse.json(
        { message: chatbotData.detail.message, status: 401 },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: chatbotData, status: 200 },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in chatbot API request:", error);
    return NextResponse.json(
      { message: "Chatbot request failed.", status: 500 },
      { status: 500 }
    );
  }
}

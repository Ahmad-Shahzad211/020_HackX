export const maxDuration = 60; // this is for the chatbot api request timeout; It is because we are on the free plan of vercel.
import { NextRequest, NextResponse } from "next/server";

// ------------------------
// Chatbots server URL
// ------------------------
const apiUrl =
  process.env.NODE_ENV === "development"
    ? process.env.DEVELOPMENT_CHATBOT_URL
    : process.env.PRODUCTION_CHATBOT_URL;

// ------------------------
// 1 universal function for all get/post api requests
// ------------------------
async function fetchChatbotData(
  url: string,
  method: string,
  token: string | undefined,
  body?: any
) {
  console.log(`body`, )
  const response = await fetch(url, {
    method: method,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: body ? body : undefined,
  });
  const resp = await response.json();
  return { ...resp, status: response.status };
}

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const token = request.headers.get("Authorization")?.split(" ")[1];

  // Check if there's an audio processing option
  const audioProcessingOption = data.get("audioProcessingOption");

  // If the option is "transcribe" and there's an audio file, we need to handle it
  // This would be implemented on the server side or through a third-party service
  // For now, we'll just pass the option to the backend API

  try {
    const chatbotData = await fetchChatbotData(
      `${apiUrl}/api/v1/chatlegis/chat`,
      "POST",
      token,
      data
    );

    if (chatbotData.detail != undefined && chatbotData.detail.status === 401) {
      return NextResponse.json(
        { message: chatbotData.detail.message, status: 401 },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: chatbotData },
      { status: chatbotData.status }
    );
  } catch (error: any) {
    console.error("Error in chatbot API request:", error);
    return NextResponse.json(
      { message: "Chatbot request failed.", status: 500 },
      { status: 500 }
    );
  }
}

// ------------------------
// Fetching user chats with chatbot
// ------------------------
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];

    const chatbotDat = await fetch(`${apiUrl}/api/v1/chatlegis/conversations`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

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

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const data = await request.json();

    if (!data.conversationId) {
      return NextResponse.json(
        { message: "Conversation ID is required.", status: 400 },
        { status: 400 }
      );
    }
    const chatbotData = await fetch(
      `${apiUrl}/delete_conversation_history?chat=${data.conversationId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const responseData = await chatbotData.json();
    if (
      responseData.detail != undefined &&
      responseData.detail.status === 401
    ) {
      return NextResponse.json(
        { message: responseData.detail.message, status: 401 },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: responseData.conversation_history, status: 200 },
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

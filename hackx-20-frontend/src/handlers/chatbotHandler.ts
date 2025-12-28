import legisStore from "@/store/legisStore";
import { axiosInstance } from "@/utils/clientUtils";
import axios from "axios";
import Cookies from "js-cookie";
export const chatbotChatHandler = async (values: any) => {
  const token = await Cookies.get("__chatLegis__");
  try {
    const resp = await axios.post("/api/chat", values, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { data: resp.data, status: resp.status };
  } catch (error: any) {
    return {
      data: { message: error.response.data.message, status: error.status },
    };
  }
};

export const fetchAllChats = async () => {
  try {
    const response = await axiosInstance.get("/chat");

    return {
      allChats: response.data,
      status: response.status,
    };
  } catch (error: any) {
    return {
      data: { message: error.response.data.message, status: error.status },
    };
  }
};

export const fetchSpecificChat = async (conversation_id: string) => {
  const token = await Cookies.get("__chatLegis__");
  try {
    const response = await axios.get(
      `/api/currentChat?conversation_id=${conversation_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      allChats: response.data,
      status: response.status,
    };
  } catch (error: any) {
    return {
      data: { message: error.response.data.message, status: error.status },
    };
  }
};

export const updateChatTitle = async (
  conversationId: string,
  title: string
) => {
  const token = await Cookies.get("__chatLegis__");

  try {
    const response = await axios.post(
      "/api/chat/updateTitle",
      { conversationId, title },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      data: response.data,
      status: response.status,
    };
  } catch (error: any) {
    return {
      data: { message: error.response.data.message, status: error.status },
    };
  }
};

export const fetchChats = async () => {
  const { setListOfChats } = legisStore.getState();

  try {
    const chats = await fetchAllChats();

    setListOfChats(chats?.allChats.message);
  } catch (error: any) {
    return {
      data: { message: error.response.data.message, status: error.status },
    };
  }
};

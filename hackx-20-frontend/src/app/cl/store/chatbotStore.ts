import { ChatbotChatType } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useChatbotStore = create<ChatbotChatType>()(
  persist(
    (set) => ({
      // State values
      sessionID: undefined,
      fetchChat: false,
      thinking: false,
      messages: [],
      inputMessage: "",

      // Actions
      setSessionID: (sessionID: string | undefined) => set({ sessionID }),
      setFetchChat: (fetchChat: boolean) => set({ fetchChat }),
      setThinking: (thinking: boolean) => set({ thinking }),
      setMessages: (messages: any) =>
        set((state: any) => ({
          messages:
            typeof messages === "function"
              ? messages(state.messages)
              : messages,
        })),
      setInputMessage: (message: any) =>
        set((state: any) => ({
          inputMessage:
            typeof message === "function"
              ? message(state.inputMessage)
              : message,
        })),
    }),
    {
      name: "chatbot-storage",
      partialize: (state) => ({
        sessionID: state.sessionID,
        messages: state.messages,
        inputMessage: state.inputMessage,
      }),
    }
  )
);

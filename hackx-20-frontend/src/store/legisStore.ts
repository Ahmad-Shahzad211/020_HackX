import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LegisType } from "@/types";

const legisStore = create<LegisType>()(
  persist(
    (set) => ({
      email: "",
      selectedTool: "",
      listOfChats: [{ id: "0", title: "Fetching Chats..." }],
      setSelectedTool: (tool: string) => set(() => ({ selectedTool: tool })),
      setEmail: (email: string) => set(() => ({ email })),
      setListOfChats: (chats) => set(() => ({ listOfChats: chats })),
    }),
    {
      name: "userStorage",
      partialize: (state) => ({ email: state.email }), // only persist email
    }
  )
);

export default legisStore;

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserInfoType } from "@/types";

export const useUserStore = create<UserInfoType>()(
  persist(
    (set) => ({
      userName: "",
      userInfo: "",
      userAvatar: "",
      devices: [],
      userRole: "user",
      setUserName: (userName) => set(() => ({ userName })),
      setUserAvatar: (userAvatar) => set(() => ({ userAvatar })),
      setUserInfo: (userInfo) => set(() => ({ userInfo })),
      setDevices: (devices) => set(() => ({ devices })),
      setUserRole: (userRole) => set(() => ({ userRole })),
    }),
    {
      name: "userInfo", // localStorage key
    }
  )
);

"use client";

import { useUserStore } from "@/app/cl/store/userInfoStore";
import { useEffect, useState } from "react";

export default function DebugUserInfo() {
  const [isVisible, setIsVisible] = useState(false);
  const userName = useUserStore((state) => state.userName);
  const userRole = useUserStore((state) => state.userRole);
  const userInfo = useUserStore((state) => state.userInfo);

  useEffect(() => {
    // Check if we're in development mode
    setIsVisible(process.env.NODE_ENV === "development");
  }, []);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 10,
        right: 10,
        background: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "8px",
        fontSize: "12px",
        zIndex: 9999,
        maxWidth: "300px",
      }}
    >
      <h4 style={{ margin: "0 0 8px 0", fontWeight: "bold" }}>
        Debug User Info
      </h4>
      <div>
        <strong>Name:</strong> {userName || "Not set"}
      </div>
      <div>
        <strong>Role:</strong> {userRole || "Not set"}
      </div>
      <div>
        <strong>LocalStorage:</strong>{" "}
        {typeof window !== "undefined"
          ? JSON.stringify(localStorage.getItem("userInfo"))
          : "N/A"}
      </div>
    </div>
  );
}

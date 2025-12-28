"use client";
import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import { motion, AnimatePresence } from "framer-motion";
import { useChatbotStore } from "@/app/cl/store/chatbotStore";

import NewChat from "./newChat";
import Messages from "./messages";
import { sidebarVariants } from "@/data/constant";
import ChatbotInput from "./chatbotInput";

export default function Chatscreen() {
  // Zustand store hooks
  const messages = useChatbotStore((state) => state.messages);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div
      className="flex h-screen overflow-hidden relative transition-colors duration-300"
      id="chat-screen"
      style={{ backgroundColor: 'var(--color-card-bg)' }}
    >
      {/* Mobile backdrop overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden transition-colors duration-300"
            style={{ background: 'var(--color-card-bg)' }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className="overflow-hidden md:relative fixed left-0 top-0 h-full z-50"
          >
            <Sidebar setIsSidebarOpen={setIsSidebarOpen} />
          </motion.div>
        )}
      </AnimatePresence>

      <main
        className={`flex-1 flex flex-col h-full overflow-hidden relative ${
          isSidebarOpen ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Navbar and title section */}
        <div className="pt-4 py-1  shrink-0">
          <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        </div>

        {/* Content area with conditional layout */}
        <div
          className={`flex-1 flex flex-col ${
            messages.length <= 0
              ? "items-center justify-center"
              : "overflow-hidden"
          }`}
        >
          {/* Messages/NewChat content */}
          {messages.length <= 0 ? (
            <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 md:px-8 lg:px-12 xl:px-16">
              <NewChat />
            </div>
          ) : (
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-gray-300 px-1 md:px-20"
            >
              <Messages />
            </div>
          )}

          {/* Single ChatbotInput with conditional styling */}
          <div
            className={`${
              messages.length <= 0
                ? "w-full max-w-4xl mx-auto px-2 sm:px-4 md:px-8 lg:px-12 xl:px-16"
                : "shrink-0 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-16 py-4 bg-transparent"
            }`}
          >
            <ChatbotInput />
          </div>
        </div>
      </main>
    </div>
  );
}

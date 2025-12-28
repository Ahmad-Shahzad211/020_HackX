import React, { useState, useEffect } from "react";
import { X, Search, Clock, MessageSquare, Bot, User } from "lucide-react";
import { useChatbotStore } from "@/app/cl/store/chatbotStore";
import { fetchSpecificChat } from "@/handlers/chatbotHandler";
import { useRouter } from "next/navigation";
import legisStore from "@/store/legisStore";
import CustomMarkdown from "@/components/ReactMarkdown";

interface ChatHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatHistoryModal: React.FC<ChatHistoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { setMessages, setSessionID } = useChatbotStore();
  const listOfChats = legisStore((state) => state.listOfChats);
  const [selectedChat, setSelectedChat] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [previewMessages, setPreviewMessages] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // 🔑 new state

  // Filter chats based on search query
  const filteredChats = Array.isArray(listOfChats)
    ? listOfChats.filter((chat) =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handlePreviewChat = async (chat: { id: string; title: string }) => {
    setSelectedChat(chat);
    try {
      const resp = await fetchSpecificChat(chat.id);
      if (resp?.allChats?.message) {
        const previewMsgs = resp.allChats.message.slice(0, 5);

        const firstAiMsg = previewMsgs.find((msg: any) => msg.role === "ai");

        setPreviewMessages(previewMsgs); // Show first 5 messages as preview
      }
    } catch (error) {
      setPreviewMessages([]);
    }
  };

  const handleSelectChat = async (conversationId: string) => {
    setMessages([]);
    setSessionID(conversationId);

    try {
      const resp = await fetchSpecificChat(conversationId);
      setMessages(resp?.allChats.message);
      onClose();
      router.refresh();
    } catch (error) {
      setErrorMessage("Failed to open conversation. Please try again.");
    }
  };

  // Close modal on escape key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Reset selected chat when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Schedule state updates asynchronously
      const id = setTimeout(() => {
        setSelectedChat(null);
        setPreviewMessages([]);
      }, 0);

      return () => clearTimeout(id);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 bg-opacity-50 transition-opacity duration-300">
      <div className="w-full max-w-5xl h-150 flex rounded-2xl shadow-xl transform transition-all duration-300 ease-out opacity-100 scale-100 translate-y-0 overflow-hidden" style={{ background: 'var(--color-card-bg)' }}>
        {/* Left side - Chat list */}
        <div className="w-2/5 flex flex-col" style={{ borderRight: '1px solid var(--color-border)', background: 'var(--color-nav-bg)' }}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
                Conversations
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full transition-colors"
                style={{ color: 'var(--color-text)' }}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-3 pl-10 pr-4 rounded-lg focus:outline-none text-sm"
                style={{ background: 'var(--color-card-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                autoFocus
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-muted)' }}>
                <Search size={16} />
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 px-4 pb-4">
            {filteredChats.length > 0 ? (
              filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handlePreviewChat(chat)}
                  className="flex flex-col p-3 mb-2 rounded-lg cursor-pointer transition-all duration-200"
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    background: selectedChat?.id === chat.id ? 'var(--color-card-bg)' : 'transparent',
                    color: 'var(--color-text)',
                  }}
                >
                  <div className="flex-1">
                    <p className="text-md font-medium truncate" style={{ color: 'var(--color-text)' }}>
                      {chat.title}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Today</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 flex flex-col items-center" style={{ color: 'var(--color-text-muted)' }}>
                <Clock size={48} style={{ color: 'var(--color-border)', marginBottom: '0.5rem' }} />
                {searchQuery
                  ? "No conversations found"
                  : "No recent conversations"}
              </div>
            )}
          </div>
        </div>

        {/* Right side - Preview */}
        <div className="w-3/5 flex flex-col" style={{ background: 'var(--background)' }}>
          <div className="p-6" style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-card-bg)' }}>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
              {selectedChat
                ? selectedChat.title
                : "Select a conversation to preview"}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {errorMessage ? (
              <div className="text-center font-medium" style={{ color: '#ef4444' }}>
                {errorMessage}
              </div>
            ) : selectedChat ? (
              previewMessages.length > 0 ? (
                <div className="space-y-4">
                  {previewMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 ${
                        msg.role === "user" ? "justify-end" : ""
                      }`}
                    >
                      {msg.role !== "user" && (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm" style={{ background: 'var(--color-primary)' }}>
                          <Bot size={16} style={{ color: 'white' }} />
                        </div>
                      )}
                      <div
                        className="max-w-[80%] p-3 rounded-lg shadow-sm text-sm whitespace-pre-wrap"
                        style={{
                          background: msg.role === "user" ? 'var(--color-primary)' : 'var(--color-card-bg)',
                          color: msg.role === "user" ? 'white' : 'var(--color-text)',
                          borderBottomRightRadius: msg.role === "user" ? '0.2rem' : '0.75rem',
                          borderBottomLeftRadius: msg.role === "user" ? '0.75rem' : '0.2rem',
                        }}
                      >
                        {msg.role === "user" ? (
                          <CustomMarkdown
                            content={msg.prompt}
                            isUserMessage={true}
                          />
                        ) : msg.type === "thinking" ? (
                          "Thinking..."
                        ) : (
                          <CustomMarkdown
                            content={
                              typeof msg.prompt === "string" &&
                              msg.prompt.trim() !== ""
                                ? msg.prompt
                                : typeof msg.ai_response === "string" &&
                                  msg.ai_response.trim() !== ""
                                ? msg.ai_response
                                : typeof msg.response === "string" &&
                                  msg.response.trim() !== ""
                                ? msg.response
                                : "No response available"
                            }
                            isUserMessage={false}
                          />
                        )}
                      </div>
                      {msg.role === "user" && (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm" style={{ background: 'var(--color-primary)' }}>
                          <User size={16} style={{ color: 'white' }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full" style={{ color: 'var(--color-text-muted)' }}>
                  <MessageSquare size={48} style={{ marginBottom: '0.5rem', color: 'var(--color-border)' }} />
                  <p>Loading conversation preview...</p>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full" style={{ color: 'var(--color-text-muted)' }}>
                <MessageSquare size={48} style={{ marginBottom: '0.5rem', color: 'var(--color-border)' }} />
                <p>Select a conversation to see a preview</p>
              </div>
            )}
          </div>

          <div className="p-4 text-center" style={{ borderTop: '1px solid var(--color-border)' }}>
            <button
              onClick={() => selectedChat && handleSelectChat(selectedChat.id)}
              className="px-4 py-2 rounded-lg transition-all duration-200"
              style={{
                background: selectedChat ? 'var(--color-primary)' : 'var(--color-border)',
                color: selectedChat ? 'white' : 'var(--color-text-muted)',
                cursor: selectedChat ? 'pointer' : 'not-allowed',
                opacity: selectedChat ? 1 : 0.7,
              }}
              disabled={!selectedChat}
            >
              Open Conversation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHistoryModal;

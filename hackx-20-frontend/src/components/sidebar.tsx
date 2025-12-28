"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useTransition,
} from "react";
import {
  ArrowLeftFromLine,
  UserCircle,
  MessageCirclePlus,
  X,
  Edit2,
  Check,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useChatbotStore } from "@/app/cl/store/chatbotStore";
import { useUserStore } from "@/app/cl/store/userInfoStore";
import { logoutHandler } from "@/handlers/regloHandler";
import { UAParser } from "ua-parser-js";
import {
  fetchChats,
  fetchSpecificChat,
  updateChatTitle,
} from "@/handlers/chatbotHandler";
import legisStore from "@/store/legisStore";
import ChatHistoryModal from "./chatHistory/ChatHistoryModal";
import SearchButton from "./chatHistory/SearchButton";
import { getLocation } from "@/utils/clientUtils";
import { getUserInfoHandler } from "@/app/cl/handlers/userInfo";
import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
}

interface SidebarProps {
  setIsSidebarOpen: (isOpen: boolean) => void;
}

/* ======================= SidebarItem ======================= */
function SidebarItem({ icon, label, href }: SidebarItemProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = async () => {
    startTransition(async () => {
      try {
        const locationInfo = await getLocation();
        const devices = UAParser(navigator.userAgent);

        const userDetails = {
          ipAddress: locationInfo.ip,
          browser: devices.browser.name,
          browserVersion: devices.browser.version,
          osName: devices.os.name,
        };

        await logoutHandler(userDetails);
        sessionStorage.clear();
        localStorage.clear();

        router.push("/auth/login");
      } catch (error: any) {
        console.error("Logout error:", error.message);
      }
    });
  };

  // Detect if icon is a URL (string) or React element
  const renderIcon = () => {
    if (typeof icon === "string" && icon.startsWith("http")) {
      return (
        <Image
          src={icon}
          alt="icon"
          width={28}
          height={28}
          className="rounded-full object-cover"
        />
      );
    }
    return <span style={{ color: 'var(--color-sidebar-icon)' }}>{icon}</span>;
  };

  // ✅ Logout button (special case)
  if (label.toLowerCase() === "logout") {
    return (
      <button
        onClick={handleLogout}
        disabled={isPending}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          color: 'var(--color-sidebar-text)',
          background: 'transparent',
          fontSize: '1.125rem',
          fontWeight: 500,
          borderRadius: '0.5rem',
          padding: '0.75rem 0',
          transition: 'background 0.2s, color 0.2s',
          opacity: isPending ? 0.5 : 1,
        }}
      >
        {isPending ? (
          <Loader2 className="animate-spin" size={18} style={{ color: 'var(--color-sidebar-icon)' }} />
        ) : (
          <>
            {renderIcon()}
            <span style={{ color: 'var(--color-sidebar-text)', fontWeight: 500 }}>{label}</span>
          </>
        )}
      </button>
    );
  }

  // ✅ Default link item
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        color: 'var(--color-sidebar-text)',
        background: 'transparent',
        fontSize: '1.125rem',
        fontWeight: 500,
        borderRadius: '0.5rem',
        padding: '0.75rem 0',
        transition: 'background 0.2s, color 0.2s',
      }}
    >
      {renderIcon()}
      <span style={{ color: 'var(--color-sidebar-text)', fontWeight: 500 }}>{label}</span>
    </Link>
  );
}

/* ======================= Sidebar ======================= */
export default function Sidebar({ setIsSidebarOpen }: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingChatId, setLoadingChatId] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingChatName, setEditingChatName] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { setMessages, setSessionID, sessionID } = useChatbotStore();
  const userName = useUserStore((state) => state.userName);
  const avatarUrl = useUserStore((state) => state.userAvatar);
  const setUserName = useUserStore((state) => state.setUserName);
  const setAvatarUrl = useUserStore((state) => state.setUserAvatar);
  const listOfChats = legisStore((state) => state.listOfChats);
  const setListOfChats = legisStore((state) => state.setListOfChats);
  const setSelectedTool = legisStore((state) => state.setSelectedTool);

  /* ----------------- Load chats ----------------- */
  useEffect(() => {
    const loadChats = async () => {
      setLoading(true);
      await fetchChats();
      setLoading(false);
    };
    loadChats();
  }, []);
  /* ----------------- Get user details ----------------- */
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);

        const resp = await getUserInfoHandler();

        setUserName(resp.data.fullName);
        setAvatarUrl(resp.data.avatarUrl);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, []);

  /* ----------------- Click outside edit field ----------------- */
  useEffect(() => {
    if (!editingChatId) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        editInputRef.current &&
        !editInputRef.current.contains(event.target as Node)
      ) {
        setEditingChatId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editingChatId]);

  /* ----------------- Handle responsiveness ----------------- */
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setIsSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsSidebarOpen]);

  /* ----------------- Handlers ----------------- */
  const handleNewChat = useCallback(() => {
    setLoadingChatId("new");
    setMessages([]);
    setSessionID("");
    setSelectedTool("");
    if (isMobile) setIsSidebarOpen(false);
    setTimeout(() => setLoadingChatId(null), 500);
  }, [setMessages, setSessionID, isMobile, setIsSidebarOpen]);

  const handleClick = useCallback(
    async (conversation_id: string) => {
      if (editingChatId && editingChatId !== conversation_id) {
        setEditingChatId(null);
      }
      setLoadingChatId(conversation_id);
      setMessages([]);
      setSessionID(conversation_id);
      if (isMobile) setIsSidebarOpen(false);

      try {
        const resp = await fetchSpecificChat(conversation_id);
        if (resp?.allChats.message) {
          const transformedMessages = resp.allChats.message.map((msg: any) =>
            msg.role === "ai"
              ? { ...msg, ai_response: msg.prompt, prompt: undefined }
              : msg
          );
          setMessages(transformedMessages);
          router.refresh();
        }
      } catch {
        alert("Error! Failed to fetch chats.");
      } finally {
        setLoadingChatId(null);
      }
    },
    [
      editingChatId,
      router,
      setMessages,
      setSessionID,
      isMobile,
      setIsSidebarOpen,
    ]
  );

  const handleEditChat = useCallback(
    (e: React.MouseEvent, chatId: string, currentName: string) => {
      e.stopPropagation();
      setEditingChatId(chatId);
      setEditingChatName(currentName);
      setTimeout(() => {
        editInputRef.current?.focus();
        editInputRef.current?.select();
      }, 50);
    },
    []
  );

  const handleSaveEditedChat = useCallback(
    async (e: React.MouseEvent, chatId: string) => {
      e.stopPropagation();
      if (!editingChatName.trim()) return;
      try {
        const response = await updateChatTitle(chatId, editingChatName);
        if (response?.status === 200) {
          setListOfChats(
            listOfChats.map((chat) =>
              chat.id === chatId ? { ...chat, title: editingChatName } : chat
            )
          );
        }
      } catch (error) {
        console.error("Error updating chat name:", error);
      }
      setEditingChatId(null);
      setEditingChatName("");
    },
    [editingChatName, listOfChats, setListOfChats]
  );

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent, chatId: string) => {
      if (e.key === "Enter") {
        handleSaveEditedChat(e as unknown as React.MouseEvent, chatId);
      } else if (e.key === "Escape") {
        setEditingChatId(null);
        setEditingChatName("");
      }
    },
    [handleSaveEditedChat]
  );

  /* ----------------- JSX ----------------- */
  return (
    <aside
      className="relative z-10 h-[calc(100vh-10px)] w-[270px] flex flex-col py-8 px-4 rounded-[0.7rem] mt-1 ml-[5px] overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: 'var(--background)', border: '1px solid var(--color-border)' }}
    >
      {/* Logo */}
      <div className="flex items-center mb-6 justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-card-bg)' }}>
            <Link href="/">
              <Image
                src="/chatlegis.svg"
                alt="Reglo Logo"
                width={50}
                height={10}
              />
            </Link>
          </div>
          <span className="ml-4 text-xl font-semibold transition-colors duration-300" style={{ color: 'var(--color-primary)' }}>
            Chat Legis
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isMobile && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="ml-2 p-2 rounded transition-colors duration-200"
              style={{ background: 'var(--color-input-bg)' }}
            >
              <X size={28} style={{ color: 'var(--color-text)' }} />
            </button>
          )}
        </div>
      </div>

      {/* New Chat */}
      <div className="flex justify-end">
        <button
          onClick={handleNewChat}
          disabled={loadingChatId === "new"}
          className="flex items-center space-x-3 w-full px-4 py-2 rounded-lg text-lg font-medium transition disabled:opacity-50"
          style={{
            background: 'var(--color-input-bg)',
            color: 'var(--color-primary)',
          }}
        >
          {loadingChatId === "new" ? (
            <div className="w-4 h-4 border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
          ) : (
            <MessageCirclePlus size={15} />
          )}
          <span className="text-sm">
            {loadingChatId === "new" ? "Creating..." : "New Chat"}
          </span>
        </button>
      </div>

      {/* Search Button */}
      <div className="my-4 relative">
        <SearchButton onClick={() => setIsSearchModalOpen(true)} />
      </div>

      {/* Search Modal */}
      <ChatHistoryModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />

      {/* Chats List */}
      <div className="flex flex-col overflow-y-auto space-y-1 scrollbar-hide mt-0 mb-2">
        {loading && listOfChats?.length === 0 ? (
          <div className="text-md py-2 px-3" style={{ color: 'var(--color-text-muted)' }}>
            Fetching Chats...
          </div>
        ) : !loading && listOfChats?.length <= 0 ? (
          <div className="text-md py-2 px-3" style={{ color: 'var(--color-text-muted)' }}>
            Start a new conversation
          </div>
        ) : (
          listOfChats?.map((chat) => (
            <div
              onClick={() => handleClick(chat.id)}
              key={chat.id}
              className={`group flex items-center justify-between text-md py-2 px-3 rounded cursor-pointer transition-colors duration-200 ${
                sessionID === chat.id ? "" : "hover:bg-[var(--color-input-bg)]"
              } ${
                sessionID === chat.id ? "bg-[var(--color-input-bg)]" : ""
              } ${
                loadingChatId === chat.id ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{ color: 'var(--color-text)' }}
            >
              {editingChatId === chat.id ? (
                <div
                  className="flex items-center justify-between w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editingChatName}
                    onChange={(e) => setEditingChatName(e.target.value)}
                    onKeyDown={(e) => handleEditKeyDown(e, chat.id)}
                    className="w-full py-1 px-2 rounded outline-none transition-colors duration-200"
                    style={{ background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                    autoFocus
                  />
                  <button
                    onClick={(e) => handleSaveEditedChat(e, chat.id)}
                    className="ml-2 p-1 rounded-full transition-colors duration-200"
                    style={{ background: 'var(--color-card-bg)' }}
                  >
                    <Check size={16} style={{ color: 'var(--color-primary)' }} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="truncate flex-1 flex items-center">
                    {chat.title}
                    {loadingChatId === chat.id && (
                      <div className="ml-2 w-3 h-3 border border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
                    )}
                  </div>
                  {sessionID === chat.id && loadingChatId !== chat.id && (
                    <button
                      onClick={(e) => handleEditChat(e, chat.id, chat.title)}
                      className="ml-2 p-1 opacity-0 group-hover:opacity-100 rounded-full transition-colors duration-200"
                      style={{ background: 'var(--color-card-bg)' }}
                    >
                      <Edit2 size={14} style={{ color: 'var(--color-primary)' }} />
                    </button>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>

      <div className="my-2" style={{ borderTop: '1px solid var(--color-border)' }} />

      <div className="mt-auto flex flex-col gap-2">
        <SidebarItem
          icon={avatarUrl ? avatarUrl : <UserCircle size={20} />}
          label={userName ?? "Profile"}
          href="/cl/settings/profile"
        />
        <SidebarItem
          icon={<ArrowLeftFromLine size={20} />}
          label="Logout"
          href="#"
        />
      </div>
    </aside>
  );
}

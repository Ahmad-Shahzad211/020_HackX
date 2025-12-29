export interface ChatType {
  id: string;
  title: string;
}

export interface LegisType {
  email: string;
  selectedTool: string;
  listOfChats: ChatType[];
  setSelectedTool: (tool: string) => void;
  setEmail: (email: string) => void;
  setListOfChats: (chats: ChatType[]) => void;
}

type Role = "admin" | "user" | "ai"; // Roles we are going to assign
export interface ChatbotMessageType {
  conversation_id: string | undefined;
  ai_response?: string;
  role: Role;
  type?: string;
  document_category?: string;
  prompt?: string;
  file?: File[] | string;
  timestamp?: string;
}

export interface ChatbotChatType {
  sessionID: string | undefined;

  fetchChat: boolean;

  thinking: boolean;

  messages: ChatbotMessageType[];
  inputMessage: string;

  setSessionID: (sessionID: string | undefined) => void;

  setFetchChat: (fetchChat: boolean) => void;
  setThinking: (thinking: boolean) => void;

  // This line is the key change - allowing messages to be either an array or a function
  setMessages: (
    messages:
      | ChatbotMessageType[]
      | ((prevMessages: ChatbotMessageType[]) => ChatbotMessageType[])
  ) => void;
  setInputMessage: (message: string | ((prev: string) => string)) => void;
}

export type DeviceType = {
  ipAddress: string;
  country: string;
  city: string;
  browser: string;
  browserVersion: string;
  osName: string;
  lastActive: string | Date;
};

export type UserInfoType = {
  userName: string;
  userAvatar: string;
  userInfo: any;
  devices: any;
  userRole?: string;
  setUserName: (userName: string) => void;
  setUserAvatar: (userAvatar: string) => void;
  setDevices: (devices: any) => void;
  setUserInfo: (userInfo: any) => void;
  setUserRole?: (role: string) => void;
};

export interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
}

export interface UpdateUserProps {
  fullName?: string;
  userpassword?: string;
  avatarUrl?: string;
  removeAllDevices?: boolean;
  deviceToRemove?: string;
}

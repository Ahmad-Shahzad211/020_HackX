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

export interface UpdateUserProps {
  fullName?: string;
  userpassword?: string;
  avatarUrl?: string;
  removeAllDevices?: boolean;
  deviceToRemove?: string;
}

export type UserInfoType = {
  userName: string;
  userAvatar: string;
  userInfo: any;
  devices: any;
  setUserName: (userName: string) => void;
  setUserAvatar: (userAvatar: string) => void;
  setDevices: (devices: any) => void;
  setUserInfo: (userInfo: any) => void;
};

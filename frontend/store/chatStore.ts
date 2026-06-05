import { create } from 'zustand';

interface Message {
  id: string;
  content: string;
  imageUrl?: string | null;
  createdAt: Date;
  senderId: string;
  sender: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface Conversation {
  id: string;
  participantIds: string[];
  participants?: any[];
  messages?: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface Group {
  id: string;
  name: string;
  image?: string | null;
  description?: string | null;
  creatorId: string;
  members?: any[];
  messages?: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatState {
  conversations: Conversation[];
  groups: Group[];
  activeConversation: Conversation | null;
  activeGroup: Group | null;
  messages: Message[];
  typingUsers: { [key: string]: boolean };
  onlineUsers: Set<string>;
  
  setConversations: (conversations: Conversation[]) => void;
  setGroups: (groups: Group[]) => void;
  setActiveConversation: (conversation: Conversation | null) => void;
  setActiveGroup: (group: Group | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setTyping: (userId: string, isTyping: boolean) => void;
  setUserOnline: (userId: string, isOnline: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  groups: [],
  activeConversation: null,
  activeGroup: null,
  messages: [],
  typingUsers: {},
  onlineUsers: new Set(),

  setConversations: (conversations) => set({ conversations }),
  setGroups: (groups) => set({ groups }),
  setActiveConversation: (conversation) => set({ 
    activeConversation: conversation, 
    activeGroup: null,
    messages: conversation?.messages || []
  }),
  setActiveGroup: (group) => set({ 
    activeGroup: group, 
    activeConversation: null,
    messages: group?.messages || []
  }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  setTyping: (userId, isTyping) => set((state) => ({
    typingUsers: { ...state.typingUsers, [userId]: isTyping }
  })),
  setUserOnline: (userId, isOnline) => set((state) => {
    const newOnlineUsers = new Set(state.onlineUsers);
    if (isOnline) {
      newOnlineUsers.add(userId);
    } else {
      newOnlineUsers.delete(userId);
    }
    return { onlineUsers: newOnlineUsers };
  }),
}));

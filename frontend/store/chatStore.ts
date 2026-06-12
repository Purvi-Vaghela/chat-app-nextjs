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
  isDeletedForEveryone?: boolean;
  deletedFor?: string[];
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
  isSelectionMode: boolean;
  selectedMessageIds: string[];
  isDeleteModalOpen: boolean;
  
  setConversations: (conversations: Conversation[]) => void;
  setGroups: (groups: Group[]) => void;
  setActiveConversation: (conversation: Conversation | null) => void;
  setActiveGroup: (group: Group | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setTyping: (userId: string, isTyping: boolean) => void;
  setUserOnline: (userId: string, isOnline: boolean) => void;
  setSelectionMode: (enabled: boolean) => void;
  toggleMessageSelection: (messageId: string) => void;
  clearMessageSelection: () => void;
  deleteMessagesLocally: (messageIds: string[]) => void;
  markMessagesDeletedForEveryone: (messageIds: string[]) => void;
  setDeleteModalOpen: (open: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  groups: [],
  activeConversation: null,
  activeGroup: null,
  messages: [],
  typingUsers: {},
  onlineUsers: new Set(),
  isSelectionMode: false,
  selectedMessageIds: [],
  isDeleteModalOpen: false,

  setConversations: (conversations) => set({ conversations }),
  setGroups: (groups) => set({ groups }),
  setActiveConversation: (conversation) => {
    if (typeof window !== 'undefined') {
      if (conversation) {
        localStorage.setItem('activeConversationId', conversation.id);
        localStorage.removeItem('activeGroupId');
      } else {
        localStorage.removeItem('activeConversationId');
      }
    }
    set({ 
      activeConversation: conversation, 
      activeGroup: null,
      messages: conversation?.messages || [],
      isSelectionMode: false,
      selectedMessageIds: [],
      isDeleteModalOpen: false
    });
  },
  setActiveGroup: (group) => {
    if (typeof window !== 'undefined') {
      if (group) {
        localStorage.setItem('activeGroupId', group.id);
        localStorage.removeItem('activeConversationId');
      } else {
        localStorage.removeItem('activeGroupId');
      }
    }
    set({ 
      activeGroup: group, 
      activeConversation: null,
      messages: group?.messages || [],
      isSelectionMode: false,
      selectedMessageIds: [],
      isDeleteModalOpen: false
    });
  },
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => {
    const exists = state.messages.some((msg) => msg.id === message.id);
    if (exists) return {};
    return { messages: [...state.messages, message] };
  }),
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
  setSelectionMode: (enabled) => set({ isSelectionMode: enabled, selectedMessageIds: [], isDeleteModalOpen: false }),
  toggleMessageSelection: (messageId) => set((state) => {
    const selected = state.selectedMessageIds.includes(messageId);
    const updated = selected
      ? state.selectedMessageIds.filter((id) => id !== messageId)
      : [...state.selectedMessageIds, messageId];
    return { selectedMessageIds: updated };
  }),
  clearMessageSelection: () => set({ selectedMessageIds: [], isSelectionMode: false, isDeleteModalOpen: false }),
  deleteMessagesLocally: (messageIds) => set((state) => ({
    messages: state.messages.filter((msg) => !messageIds.includes(msg.id))
  })),
  markMessagesDeletedForEveryone: (messageIds) => set((state) => ({
    messages: state.messages.map((msg) =>
      messageIds.includes(msg.id)
        ? { ...msg, isDeletedForEveryone: true, content: 'This message was deleted', imageUrl: null }
        : msg
    )
  })),
  setDeleteModalOpen: (open) => set({ isDeleteModalOpen: open }),
}));

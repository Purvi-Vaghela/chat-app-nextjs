'use client';

import { useChatStore } from '@/store/chatStore';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import SelectionActionBar from './SelectionActionBar';
import EmptyChat from './EmptyChat';

export default function ChatWindow() {
  const { activeConversation, activeGroup, isSelectionMode } = useChatStore();

  if (!activeConversation && !activeGroup) {
    return <EmptyChat />;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-light-chat dark:bg-dark-chat relative">
      <ChatHeader />
      <MessageList />
      {isSelectionMode ? <SelectionActionBar /> : <MessageInput />}
    </div>
  );
}

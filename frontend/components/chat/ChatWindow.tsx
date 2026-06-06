'use client';

import { useChatStore } from '@/store/chatStore';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import EmptyChat from './EmptyChat';

export default function ChatWindow() {
  const { activeConversation, activeGroup } = useChatStore();

  if (!activeConversation && !activeGroup) {
    return <EmptyChat />;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-light-chat dark:bg-dark-chat">
      <ChatHeader />
      <MessageList />
      <MessageInput />
    </div>
  );
}

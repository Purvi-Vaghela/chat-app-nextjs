'use client';

import { useEffect } from 'react';
import { useChatStore } from '@/store/chatStore';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import SelectionActionBar from './SelectionActionBar';
import EmptyChat from './EmptyChat';

export default function ChatWindow() {
  const { activeConversation, activeGroup, isSelectionMode, clearMessageSelection } = useChatStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearMessageSelection();
      }
    };

    if (isSelectionMode) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSelectionMode, clearMessageSelection]);

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

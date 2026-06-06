'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useChatStore } from '@/store/chatStore';
import MessageBubble from './MessageBubble';

export default function MessageList() {
  const { data: session } = useSession();
  const { messages } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-light-text-secondary dark:text-dark-text-secondary">
        <p className="text-sm">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
      {messages.map((message, index) => {
        const isOwnMessage = message.senderId === session?.user?.id;
        const showAvatar =
          index === messages.length - 1 ||
          messages[index + 1]?.senderId !== message.senderId;

        return (
          <MessageBubble
            key={message.id}
            message={message}
            isOwnMessage={isOwnMessage}
            showAvatar={showAvatar}
          />
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

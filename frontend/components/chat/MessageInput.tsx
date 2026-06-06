'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { BsEmojiSmile, BsImage, BsSend } from 'react-icons/bs';
import { useChatStore } from '@/store/chatStore';
import { socketClient } from '@/lib/socket';
import toast from 'react-hot-toast';

export default function MessageInput() {
  const { data: session } = useSession();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { activeConversation, activeGroup } = useChatStore();

  const handleTyping = (value: string) => {
    setMessage(value);

    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      if (activeConversation) {
        socketClient.emit('typing:start', {
          conversationId: activeConversation.id,
          userId: session?.user?.id,
          userName: session?.user?.name,
        });
      } else if (activeGroup) {
        socketClient.emit('group:typing:start', {
          groupId: activeGroup.id,
          userId: session?.user?.id,
          userName: session?.user?.name,
        });
      }
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (activeConversation) {
        socketClient.emit('typing:stop', {
          conversationId: activeConversation.id,
          userId: session?.user?.id,
        });
      } else if (activeGroup) {
        socketClient.emit('group:typing:stop', {
          groupId: activeGroup.id,
          userId: session?.user?.id,
        });
      }
    }, 3000);
  };

  const handleSend = () => {
    if (!message.trim()) return;

    const messageData = {
      content: message.trim(),
      senderId: session?.user?.id,
      imageUrl: null,
    };

    if (activeConversation) {
      socketClient.emit('message:send', {
        ...messageData,
        conversationId: activeConversation.id,
      });
    } else if (activeGroup) {
      socketClient.emit('group:message:send', {
        ...messageData,
        groupId: activeGroup.id,
      });
    }

    setMessage('');
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = () => {
    toast('Image upload coming soon!', { icon: '📷' });
  };

  return (
    <div className="h-16 bg-light-bg dark:bg-dark-sidebar border-t border-light-border dark:border-dark-border px-4 flex items-center gap-2">
      <button
        onClick={handleImageUpload}
        className="p-2 rounded-full hover:bg-light-hover dark:hover:bg-dark-hover text-light-text-secondary dark:text-dark-text-secondary transition-colors"
        aria-label="Upload image"
      >
        <BsImage className="w-5 h-5" />
      </button>

      <button
        className="p-2 rounded-full hover:bg-light-hover dark:hover:bg-dark-hover text-light-text-secondary dark:text-dark-text-secondary transition-colors"
        aria-label="Emoji"
      >
        <BsEmojiSmile className="w-5 h-5" />
      </button>

      <input
        type="text"
        value={message}
        onChange={(e) => handleTyping(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type a message..."
        className="flex-1 bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg px-4 py-2 text-light-text-primary dark:text-dark-text-primary placeholder-light-text-secondary dark:placeholder-dark-text-secondary focus:outline-none focus:border-accent"
      />

      <button
        onClick={handleSend}
        disabled={!message.trim()}
        className={`p-2 rounded-full transition-colors ${
          message.trim()
            ? 'bg-accent hover:bg-accent-hover text-white'
            : 'bg-light-hover dark:bg-dark-hover text-light-text-secondary dark:text-dark-text-secondary'
        }`}
        aria-label="Send message"
      >
        <BsSend className="w-5 h-5" />
      </button>
    </div>
  );
}

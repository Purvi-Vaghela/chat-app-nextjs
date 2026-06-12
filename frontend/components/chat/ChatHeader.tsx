'use client';

import { useSession } from 'next-auth/react';
import { useChatStore } from '@/store/chatStore';
import { BsPeopleFill, BsThreeDotsVertical } from 'react-icons/bs';

export default function ChatHeader() {
  const { data: session } = useSession();
  const { activeConversation, activeGroup, onlineUsers } = useChatStore();

  if (!activeConversation && !activeGroup) return null;

  const isGroup = !!activeGroup;
  const otherUser = activeConversation?.participants?.find(
    (p: any) => p.id !== session?.user?.id
  );
  const isOnline = otherUser ? onlineUsers.has(otherUser.id) : false;

  return (
    <div className="h-16 bg-light-bg dark:bg-dark-sidebar border-b border-light-border dark:border-dark-border px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {isGroup ? (
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
            <BsPeopleFill className="w-5 h-5" />
          </div>
        ) : otherUser?.image ? (
          <div className="relative">
            <img
              src={otherUser.image}
              alt={otherUser.name || 'User'}
              width={40}
              height={40}
              referrerPolicy="no-referrer"
              className="rounded-full w-10 h-10 object-cover"
            />
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-accent rounded-full border-2 border-light-bg dark:border-dark-sidebar"></div>
            )}
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-semibold">
            {otherUser?.name?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
        <div>
          <h2 className="font-semibold text-light-text-primary dark:text-dark-text-primary">
            {isGroup ? activeGroup?.name : otherUser?.name || 'User'}
          </h2>
          <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
            {isGroup
              ? `${activeGroup?.members?.length || 0} members`
              : isOnline
              ? 'Online'
              : 'Offline'}
          </p>
        </div>
      </div>

      <button
        className="p-2 rounded-full hover:bg-light-hover dark:hover:bg-dark-hover text-light-text-secondary dark:text-dark-text-secondary transition-colors"
        aria-label="More options"
      >
        <BsThreeDotsVertical className="w-5 h-5" />
      </button>
    </div>
  );
}

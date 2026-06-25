'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { BsPeopleFill, BsChatDots, BsSearch, BsX } from 'react-icons/bs';
import { useChatStore } from '@/store/chatStore';
import UserList from './UserList';
import GroupList from './GroupList';
import SidebarHeader from './SidebarHeader';
import ConversationList from './ConversationList';

export default function Sidebar() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'chats' | 'groups'>('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const { activeConversation, activeGroup } = useChatStore();

  const hasActiveChat = !!activeConversation || !!activeGroup;

  if (!session) return null;

  return (
    <div className={`h-full bg-light-sidebar dark:bg-dark-sidebar border-r border-light-border dark:border-dark-border flex flex-col ${
      hasActiveChat ? 'hidden md:flex md:w-[400px]' : 'flex w-full md:w-[400px]'
    }`}>
      {/* Header */}
      <SidebarHeader />

      {/* Search Bar */}
      <div className="p-3 border-b border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-sidebar">
        <div className="relative flex items-center bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl px-3 py-1.5 transition-colors focus-within:border-accent">
          <BsSearch className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search or start new chat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-light-text-primary dark:text-dark-text-primary placeholder-light-text-secondary dark:placeholder-dark-text-secondary focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary cursor-pointer flex-shrink-0"
              aria-label="Clear search"
            >
              <BsX className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-light-border dark:border-dark-border">
        <button
          onClick={() => setActiveTab('chats')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-colors ${
            activeTab === 'chats'
              ? 'text-accent border-b-2 border-accent'
              : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-hover dark:hover:bg-dark-hover'
          }`}
        >
          <BsChatDots className="w-5 h-5" />
          <span>Chats</span>
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-colors ${
            activeTab === 'groups'
              ? 'text-accent border-b-2 border-accent'
              : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-hover dark:hover:bg-dark-hover'
          }`}
        >
          <BsPeopleFill className="w-5 h-5" />
          <span>Groups</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'chats' ? (
          searchQuery ? (
            <UserList searchQuery={searchQuery} onSelectUser={() => setSearchQuery('')} />
          ) : (
            <ConversationList />
          )
        ) : (
          <GroupList />
        )}
      </div>
    </div>
  );
}

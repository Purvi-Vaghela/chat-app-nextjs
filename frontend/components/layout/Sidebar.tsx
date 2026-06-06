'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { BsPeopleFill, BsChatDots } from 'react-icons/bs';
import UserList from './UserList';
import GroupList from './GroupList';
import SidebarHeader from './SidebarHeader';

export default function Sidebar() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'chats' | 'groups'>('chats');

  if (!session) return null;

  return (
    <div className="w-full md:w-[400px] h-full bg-light-sidebar dark:bg-dark-sidebar border-r border-light-border dark:border-dark-border flex flex-col">
      {/* Header */}
      <SidebarHeader />

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
        {activeTab === 'chats' ? <UserList /> : <GroupList />}
      </div>
    </div>
  );
}

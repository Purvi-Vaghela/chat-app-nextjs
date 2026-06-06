'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { BsPeopleFill, BsPlus } from 'react-icons/bs';
import { useChatStore } from '@/store/chatStore';
import toast from 'react-hot-toast';

interface Group {
  id: string;
  name: string;
  image?: string | null;
  description?: string | null;
  members?: any[];
}

export default function GroupList() {
  const { data: session } = useSession();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const { setActiveGroup } = useChatStore();

  useEffect(() => {
    if (session?.user?.id) {
      fetchGroups();
    }
  }, [session?.user?.id]);

  const fetchGroups = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/groups/user/${session?.user?.id}`
      );
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleGroupClick = async (group: Group) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/groups/${group.id}`
      );
      setActiveGroup(response.data);
    } catch (error) {
      console.error('Error loading group:', error);
      toast.error('Failed to open group');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Create Group Button */}
      <button
        onClick={() => toast('Group creation coming soon!', { icon: '👥' })}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-light-hover dark:hover:bg-dark-hover transition-colors border-b border-light-border dark:border-dark-border"
      >
        <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white">
          <BsPlus className="w-6 h-6" />
        </div>
        <span className="font-medium text-light-text-primary dark:text-dark-text-primary">
          Create New Group
        </span>
      </button>

      {/* Groups List */}
      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-light-text-secondary dark:text-dark-text-secondary px-4">
          <BsPeopleFill className="w-12 h-12 mb-2 opacity-50" />
          <p className="text-center">No groups yet</p>
          <p className="text-sm text-center">Create one to get started!</p>
        </div>
      ) : (
        <div className="divide-y divide-light-border dark:divide-dark-border">
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => handleGroupClick(group)}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                <BsPeopleFill className="w-6 h-6" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium text-light-text-primary dark:text-dark-text-primary">
                  {group.name}
                </h3>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary truncate">
                  {group.members?.length || 0} members
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

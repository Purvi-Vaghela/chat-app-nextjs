'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { useChatStore } from '@/store/chatStore';
import { socketClient } from '@/lib/socket';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  isOnline: boolean;
}

export default function UserList() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { setActiveConversation, onlineUsers } = useChatStore();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/users`);
      // Filter out current user
      const filteredUsers = response.data.filter((u: User) => u.email !== session?.user?.email);
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = async (user: User) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/conversations/find-or-create`,
        {
          userId1: session?.user?.id,
          userId2: user.id,
        }
      );
      setActiveConversation(response.data);
      
      // Join conversation room via Socket.io
      const socket = socketClient.getSocket();
      if (socket) {
        socket.emit('conversation:join', response.data.id);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to open chat');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-light-text-secondary dark:text-dark-text-secondary">
        <p>No users found</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-light-border dark:divide-dark-border">
      {users.map((user) => {
        const isOnline = onlineUsers.has(user.id);
        return (
          <button
            key={user.id}
            onClick={() => handleUserClick(user)}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
          >
            <div className="relative">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || user.email}
                  width={48}
                  height={48}
                  className="rounded-full w-12 h-12 object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white font-semibold">
                  {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </div>
              )}
              {/* Online indicator */}
              {isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-accent rounded-full border-2 border-light-sidebar dark:border-dark-sidebar"></div>
              )}
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-medium text-light-text-primary dark:text-dark-text-primary">
                {user.name || 'Anonymous'}
              </h3>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary truncate">
                {user.email}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { format } from 'date-fns';
import { useChatStore } from '@/store/chatStore';
import { socketClient } from '@/lib/socket';
import toast from 'react-hot-toast';

export default function ConversationList() {
  const { data: session } = useSession();
  const { 
    conversations, 
    fetchConversations, 
    setActiveConversation, 
    activeConversation, 
    onlineUsers 
  } = useChatStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      loadConversations();
    }
  }, [session?.user?.id]);

  const loadConversations = async () => {
    try {
      await fetchConversations(session!.user!.id);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Failed to load recent chats');
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = async (convId: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/conversations/${convId}?userId=${session?.user?.id}`
      );
      setActiveConversation(response.data);
      
      // Join conversation room via Socket.io
      const socket = socketClient.getSocket();
      if (socket) {
        socket.emit('conversation:join', response.data.id);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
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

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-light-text-secondary dark:text-dark-text-secondary px-4 text-center">
        <p className="text-sm">No recent chats.</p>
        <p className="text-xs mt-1 text-light-text-secondary/70 dark:text-dark-text-secondary/70">
          Use the search bar above to start a new chat!
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-light-border dark:divide-dark-border">
      {conversations.map((conv) => {
        const otherParticipant = conv.participants?.find(
          (p) => p.id !== session?.user?.id
        );

        if (!otherParticipant) return null;

        const isOnline = onlineUsers.has(otherParticipant.id);
        const lastMessage = conv.messages?.[0];
        const isSelected = activeConversation?.id === conv.id;

        let timeString = '';
        if (conv.updatedAt) {
          try {
            timeString = format(new Date(conv.updatedAt), 'HH:mm');
          } catch (e) {
            console.error('Error formatting date:', e);
          }
        }

        return (
          <button
            key={conv.id}
            onClick={() => handleConversationClick(conv.id)}
            className={`w-full px-4 py-3 flex items-center gap-3 transition-colors text-left ${
              isSelected 
                ? 'bg-light-hover/40 dark:bg-dark-hover/30 border-l-4 border-accent' 
                : 'hover:bg-light-hover dark:hover:bg-dark-hover'
            }`}
          >
            <div className="relative flex-shrink-0">
              {otherParticipant.image ? (
                <img
                  src={otherParticipant.image}
                  alt={otherParticipant.name || otherParticipant.email}
                  width={48}
                  height={48}
                  referrerPolicy="no-referrer"
                  className="rounded-full w-12 h-12 object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white font-semibold">
                  {otherParticipant.name?.[0]?.toUpperCase() || otherParticipant.email[0].toUpperCase()}
                </div>
              )}
              {/* Online indicator */}
              {isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-accent rounded-full border-2 border-light-sidebar dark:border-dark-sidebar"></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <h3 className="font-medium text-light-text-primary dark:text-dark-text-primary truncate pr-2">
                  {otherParticipant.name || 'Anonymous'}
                </h3>
                {timeString && (
                  <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary/60 flex-shrink-0">
                    {timeString}
                  </span>
                )}
              </div>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary truncate">
                {lastMessage ? (
                  lastMessage.imageUrl ? '📷 Sent an image' : lastMessage.content
                ) : (
                  <span className="italic">No messages yet</span>
                )}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

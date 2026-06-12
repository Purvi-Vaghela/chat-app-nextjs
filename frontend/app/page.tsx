'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import { useSocket } from '@/hooks/useSocket';
import { useChatStore } from '@/store/chatStore';
import { socketClient } from '@/lib/socket';
import axios from 'axios';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { setActiveConversation, setActiveGroup } = useChatStore();

  useSocket(); // Connect socket and listen to events

  // Rehydrate active chat from localStorage on load
  useEffect(() => {
    if (!session?.user?.id) return;

    const rehydrateChat = async () => {
      try {
        const activeConvId = localStorage.getItem('activeConversationId');
        const activeGrpId = localStorage.getItem('activeGroupId');

        if (activeConvId) {
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/conversations/${activeConvId}?userId=${session.user.id}`
          );
          setActiveConversation(res.data);
          // Join socket room
          const socket = socketClient.getSocket();
          if (socket) {
            socket.emit('conversation:join', activeConvId);
          }
        } else if (activeGrpId) {
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/groups/${activeGrpId}?userId=${session.user.id}`
          );
          setActiveGroup(res.data);
          // Join socket room
          const socket = socketClient.getSocket();
          if (socket) {
            socket.emit('group:join', activeGrpId);
          }
        }
      } catch (err) {
        console.error('Failed to restore active chat state:', err);
        localStorage.removeItem('activeConversationId');
        localStorage.removeItem('activeGroupId');
      }
    };

    rehydrateChat();
  }, [session?.user?.id, setActiveConversation, setActiveGroup]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      <ChatWindow />
    </div>
  );
}

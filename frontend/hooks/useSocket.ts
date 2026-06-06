import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { socketClient } from '@/lib/socket';
import { useChatStore } from '@/store/chatStore';

export function useSocket() {
  const { data: session } = useSession();
  const { addMessage, setTyping, setUserOnline } = useChatStore();

  useEffect(() => {
    if (!session?.user?.id) return;

    const socket = socketClient.connect(session.user.id);

    // Listen for new messages in conversations
    socket.on('message:new', (message: any) => {
      addMessage(message);
    });

    // Listen for new messages in groups
    socket.on('group:message:new', (message: any) => {
      addMessage(message);
    });

    // Listen for typing indicators
    socket.on('typing:update', ({ userId, isTyping }: any) => {
      setTyping(userId, isTyping);
    });

    socket.on('group:typing:update', ({ userId, isTyping }: any) => {
      setTyping(userId, isTyping);
    });

    // Listen for user online/offline status
    socket.on('user:status', ({ userId, isOnline }: any) => {
      setUserOnline(userId, isOnline);
    });

    return () => {
      socket.off('message:new');
      socket.off('group:message:new');
      socket.off('typing:update');
      socket.off('group:typing:update');
      socket.off('user:status');
    };
  }, [session?.user?.id, addMessage, setTyping, setUserOnline]);
}

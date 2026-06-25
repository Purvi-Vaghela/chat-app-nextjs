'use client';

import { useSession } from 'next-auth/react';
import { useChatStore } from '@/store/chatStore';
import { BsPeopleFill, BsThreeDotsVertical, BsTrash } from 'react-icons/bs';
import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function ChatHeader() {
  const { data: session } = useSession();
  const { activeConversation, activeGroup, onlineUsers, setActiveConversation, fetchConversations } = useChatStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!activeConversation && !activeGroup) return null;

  const isGroup = !!activeGroup;
  const otherUser = activeConversation?.participants?.find(
    (p: any) => p.id !== session?.user?.id
  );
  const isOnline = otherUser ? onlineUsers.has(otherUser.id) : false;

  const handleClearChat = async () => {
    if (!activeConversation) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/conversations/${activeConversation.id}/clear`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: session?.user?.id }),
        }
      );

      if (response.ok) {
        setActiveConversation(null);
        toast.success('Chat cleared successfully');
        setShowMenu(false);
        setShowClearConfirm(false);
      } else {
        toast.error('Failed to clear chat');
      }
    } catch (error) {
      console.error('Error clearing chat:', error);
      toast.error('Error clearing chat');
    }
  };

  const handleDeleteChat = async () => {
    if (!activeConversation) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/conversations/${activeConversation.id}/delete`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: session?.user?.id }),
        }
      );

      if (response.ok) {
        setActiveConversation(null);
        if (session?.user?.id) {
          await fetchConversations(session.user.id);
        }
        toast.success('Chat deleted successfully');
        setShowMenu(false);
        setShowDeleteConfirm(false);
      } else {
        toast.error('Failed to delete chat');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('Error deleting chat');
    }
  };

  return (
    <>
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

        {/* Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full hover:bg-light-hover dark:hover:bg-dark-hover text-light-text-secondary dark:text-dark-text-secondary transition-colors"
            aria-label="More options"
          >
            <BsThreeDotsVertical className="w-5 h-5" />
          </button>

          {showMenu && !isGroup && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-sidebar rounded-lg shadow-lg border border-light-border dark:border-dark-border py-2 z-50 font-medium">
              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-light-hover dark:hover:bg-dark-hover text-light-text-primary dark:text-dark-text-primary transition-colors"
              >
                <BsTrash className="w-4 h-4 text-light-text-secondary" />
                <span>Clear Chat</span>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-light-hover dark:hover:bg-dark-hover text-red-500 transition-colors border-t border-light-border dark:border-dark-border"
              >
                <BsTrash className="w-4 h-4 text-red-500" />
                <span>Delete Chat</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-sidebar rounded-2xl shadow-xl max-w-sm w-full p-6 border border-light-border dark:border-dark-border">
            <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
              Clear Chat?
            </h2>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-6">
              Are you sure you want to clear this chat? This action cannot be undone on your side only.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleClearChat}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-lg transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 bg-light-hover dark:bg-dark-hover hover:bg-light-border dark:hover:bg-dark-border text-light-text-primary dark:text-dark-text-primary font-medium py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Chat Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-sidebar rounded-2xl shadow-xl max-w-sm w-full p-6 border border-light-border dark:border-dark-border">
            <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
              Delete Chat?
            </h2>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-6">
              Are you sure you want to delete this chat? This will remove it from your chat list and clear all messages. This action cannot be undone on your side only.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteChat}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-lg transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-light-hover dark:bg-dark-hover hover:bg-light-border dark:hover:bg-dark-border text-light-text-primary dark:text-dark-text-primary font-medium py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

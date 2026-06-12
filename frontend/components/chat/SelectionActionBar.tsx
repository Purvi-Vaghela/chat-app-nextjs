'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { useChatStore } from '@/store/chatStore';
import toast from 'react-hot-toast';
import { socketClient } from '@/lib/socket';

export default function SelectionActionBar() {
  const { data: session } = useSession();
  const {
    messages,
    selectedMessageIds,
    clearMessageSelection,
    deleteMessagesLocally,
    markMessagesDeletedForEveryone,
    isDeleteModalOpen,
    setDeleteModalOpen,
    conversations,
    groups,
  } = useChatStore();

  const [deleteMedia, setDeleteMedia] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [forwardSearch, setForwardSearch] = useState('');

  const selectedCount = selectedMessageIds.length;
  if (selectedCount === 0) return null;

  // Check if all selected messages were sent by the current user
  const isAllOwn = selectedMessageIds.every((id) => {
    const msg = messages.find((m) => m.id === id);
    return msg?.senderId === session?.user?.id;
  });

  // Check if any selected message contains an image
  const hasImage = selectedMessageIds.some((id) => {
    const msg = messages.find((m) => m.id === id);
    return !!msg?.imageUrl;
  });

  const handleDelete = async (type: 'me' | 'everyone') => {
    setLoading(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/messages/delete`,
        {
          messageIds: selectedMessageIds,
          type,
          userId: session?.user?.id,
        }
      );

      if (type === 'everyone') {
        markMessagesDeletedForEveryone(selectedMessageIds);
        toast.success('Deleted for everyone');
      } else {
        deleteMessagesLocally(selectedMessageIds);
        toast.success('Deleted for me');
      }

      clearMessageSelection();
    } catch (error: any) {
      console.error('Error deleting messages:', error);
      toast.error(error.response?.data?.error || 'Failed to delete messages');
    } finally {
      setLoading(false);
    }
  };

  const handleForward = async (target: { type: 'chat' | 'group'; id: string }) => {
    setLoading(true);
    try {
      const selectedMsgs = selectedMessageIds
        .map((id) => messages.find((m) => m.id === id))
        .filter(Boolean) as any[];

      for (const msg of selectedMsgs) {
        const messageData = {
          content: msg.content || '',
          senderId: session?.user?.id,
          imageUrl: msg.imageUrl || null,
        };

        if (target.type === 'chat') {
          socketClient.emit('message:send', {
            ...messageData,
            conversationId: target.id,
          });
        } else {
          socketClient.emit('group:message:send', {
            ...messageData,
            groupId: target.id,
          });
        }
      }

      toast.success(`Forwarded ${selectedMsgs.length} message(s)`);
      clearMessageSelection();
      setIsForwardModalOpen(false);
    } catch (error) {
      console.error('Error forwarding messages:', error);
      toast.error('Failed to forward messages');
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const otherUser = conv.participants?.find((p: any) => p.id !== session?.user?.id);
    if (!otherUser) return false;
    const name = otherUser.name || otherUser.email || 'Anonymous';
    return name.toLowerCase().includes(forwardSearch.toLowerCase());
  });

  const filteredGroups = groups.filter((group) => {
    return group.name.toLowerCase().includes(forwardSearch.toLowerCase());
  });

  return (
    <>
      <div className="h-16 bg-light-bg dark:bg-dark-sidebar border-t border-light-border dark:border-dark-border px-6 flex items-center justify-between shadow-md select-none">
        {/* Left Side: Close and Count */}
        <div className="flex items-center gap-4 text-light-text-primary dark:text-dark-text-primary">
          <button
            onClick={clearMessageSelection}
            className="p-1 rounded hover:bg-light-hover dark:hover:bg-dark-hover transition-colors cursor-pointer"
            aria-label="Cancel selection"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <span className="font-medium text-base md:text-lg">
            {selectedCount} selected
          </span>
        </div>

        {/* Right Side: Action Icons */}
        <div className="flex items-center gap-6 text-light-text-secondary dark:text-dark-text-secondary">
          {/* Star Icon */}
          <button
            onClick={() => toast('Starred functionality coming soon!')}
            className="p-1.5 rounded hover:bg-light-hover dark:hover:bg-dark-hover transition-colors hover:text-accent cursor-pointer"
            title="Star message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.969 0 1.371 1.24.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.176 0l-3.97 2.883c-.783.57-.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.97-2.883c-.783-.57-.38-1.81.588-1.81h4.906a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>

          {/* Delete (Trash) Icon */}
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="p-1.5 rounded hover:bg-light-hover dark:hover:bg-dark-hover transition-colors hover:text-red-500 cursor-pointer"
            title="Delete message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>

          {/* Forward Icon */}
          <button
            onClick={() => setIsForwardModalOpen(true)}
            className="p-1.5 rounded hover:bg-light-hover dark:hover:bg-dark-hover transition-colors hover:text-accent cursor-pointer"
            title="Forward message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 10H11a8 8 0 00-8 8v2M21 10l-6 6m6-6L15 4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal (WhatsApp design style) */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-light-bg dark:bg-dark-sidebar border border-light-border dark:border-dark-border rounded-xl shadow-2xl p-6 w-full max-w-sm text-light-text-primary dark:text-dark-text-primary transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <h3 className="text-lg font-semibold mb-4 text-light-text-primary dark:text-dark-text-primary">
              Delete {selectedCount === 1 ? 'message?' : 'messages?'}
            </h3>

            {/* Checkbox option if image/media is selected */}
            {hasImage && (
              <div
                onClick={() => setDeleteMedia(!deleteMedia)}
                className="flex items-center gap-3 mb-6 cursor-pointer select-none"
              >
                {deleteMedia ? (
                  <div className="w-5 h-5 rounded border border-accent bg-accent flex items-center justify-center text-white">
                    <svg className="w-3.5 h-3.5 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded border-2 border-light-text-secondary/50 dark:border-dark-text-secondary/50"></div>
                )}
                <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Delete file from your phone
                </span>
              </div>
            )}

            {/* Actions aligned in vertical list, right-aligned, matches WhatsApp */}
            <div className="flex flex-col gap-2 items-end justify-end w-full">
              {isAllOwn ? (
                <>
                  <button
                    disabled={loading}
                    onClick={() => handleDelete('everyone')}
                    className="w-full text-right px-4 py-2 text-accent hover:bg-light-hover dark:hover:bg-dark-hover rounded font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Delete for everyone
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => handleDelete('me')}
                    className="w-full text-right px-4 py-2 text-accent hover:bg-light-hover dark:hover:bg-dark-hover rounded font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Delete for me
                  </button>
                </>
              ) : (
                <button
                  disabled={loading}
                  onClick={() => handleDelete('me')}
                  className="w-full text-right px-4 py-2 text-accent hover:bg-light-hover dark:hover:bg-dark-hover rounded font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Delete for me
                </button>
              )}
              <button
                disabled={loading}
                onClick={() => setDeleteModalOpen(false)}
                className="w-full text-right px-4 py-2 text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-hover dark:hover:bg-dark-hover rounded transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forward Modal */}
      {isForwardModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-light-bg dark:bg-dark-sidebar border border-light-border dark:border-dark-border rounded-xl shadow-2xl p-6 w-full max-w-md text-light-text-primary dark:text-dark-text-primary transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Forward {selectedCount} message{selectedCount === 1 ? '' : 's'} to
              </h3>
              <button
                onClick={() => setIsForwardModalOpen(false)}
                className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary p-1 rounded cursor-pointer"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search Destination */}
            <div className="mb-4 relative">
              <input
                type="text"
                placeholder="Search chats or groups..."
                value={forwardSearch}
                onChange={(e) => setForwardSearch(e.target.value)}
                className="w-full bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent text-light-text-primary dark:text-dark-text-primary placeholder-light-text-secondary dark:placeholder-dark-text-secondary"
              />
            </div>

            {/* Target List */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {/* Chats Section */}
              <div className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary px-2 py-1 uppercase tracking-wider">
                Recent Chats
              </div>
              {filteredConversations.length === 0 && (
                <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary px-2 py-2 italic">
                  No chats found
                </div>
              )}
              {filteredConversations.map((conv) => {
                const otherUser = conv.participants?.find((p: any) => p.id !== session?.user?.id);
                if (!otherUser) return null;
                return (
                  <button
                    key={conv.id}
                    disabled={loading}
                    onClick={() => handleForward({ type: 'chat', id: conv.id })}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors flex items-center gap-3 disabled:opacity-50 cursor-pointer"
                  >
                    {otherUser.image ? (
                      <img
                        src={otherUser.image}
                        alt={otherUser.name || 'User'}
                        width={32}
                        height={32}
                        referrerPolicy="no-referrer"
                        className="rounded-full w-8 h-8 object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {otherUser.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="font-medium text-sm truncate">
                      {otherUser.name || otherUser.email || 'Anonymous'}
                    </span>
                  </button>
                );
              })}

              <div className="h-4"></div>

              {/* Groups Section */}
              <div className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary px-2 py-1 uppercase tracking-wider">
                Groups
              </div>
              {filteredGroups.length === 0 && (
                <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary px-2 py-2 italic">
                  No groups found
                </div>
              )}
              {filteredGroups.map((group) => {
                return (
                  <button
                    key={group.id}
                    disabled={loading}
                    onClick={() => handleForward({ type: 'group', id: group.id })}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors flex items-center gap-3 disabled:opacity-50 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <span className="font-medium text-sm truncate">
                      {group.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

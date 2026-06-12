'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { useChatStore } from '@/store/chatStore';
import toast from 'react-hot-toast';

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
  } = useChatStore();

  const [deleteMedia, setDeleteMedia] = useState(true);
  const [loading, setLoading] = useState(false);

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

  return (
    <>
      <div className="h-16 bg-light-bg dark:bg-dark-sidebar border-t border-light-border dark:border-dark-border px-6 flex items-center justify-between shadow-md select-none">
        {/* Left Side: Close and Count */}
        <div className="flex items-center gap-4 text-light-text-primary dark:text-dark-text-primary">
          <button
            onClick={clearMessageSelection}
            className="p-1 rounded hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
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
            className="p-1.5 rounded hover:bg-light-hover dark:hover:bg-dark-hover transition-colors hover:text-accent"
            title="Star message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.969 0 1.371 1.24.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.176 0l-3.97 2.883c-.783.57-.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.97-2.883c-.783-.57-.38-1.81.588-1.81h4.906a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>

          {/* Delete (Trash) Icon */}
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="p-1.5 rounded hover:bg-light-hover dark:hover:bg-dark-hover transition-colors hover:text-red-500"
            title="Delete message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>

          {/* Forward Icon */}
          <button
            onClick={() => toast('Forwarding functionality coming soon!')}
            className="p-1.5 rounded hover:bg-light-hover dark:hover:bg-dark-hover transition-colors hover:text-accent"
            title="Forward message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 10H11a8 8 0 00-8 8v2M21 10l-6 6m6-6L15 4" />
            </svg>
          </button>

          {/* Download Icon */}
          <button
            onClick={() => toast('Download functionality coming soon!')}
            className="p-1.5 rounded hover:bg-light-hover dark:hover:bg-dark-hover transition-colors hover:text-accent"
            title="Download media"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
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
                    className="w-full text-right px-4 py-2 text-accent hover:bg-light-hover dark:hover:bg-dark-hover rounded font-semibold transition-colors disabled:opacity-50"
                  >
                    Delete for everyone
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => handleDelete('me')}
                    className="w-full text-right px-4 py-2 text-accent hover:bg-light-hover dark:hover:bg-dark-hover rounded font-semibold transition-colors disabled:opacity-50"
                  >
                    Delete for me
                  </button>
                </>
              ) : (
                <button
                  disabled={loading}
                  onClick={() => handleDelete('me')}
                  className="w-full text-right px-4 py-2 text-accent hover:bg-light-hover dark:hover:bg-dark-hover rounded font-semibold transition-colors disabled:opacity-50"
                >
                  Delete for me
                </button>
              )}
              <button
                disabled={loading}
                onClick={() => setDeleteModalOpen(false)}
                className="w-full text-right px-4 py-2 text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-hover dark:hover:bg-dark-hover rounded transition-colors disabled:opacity-50"
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

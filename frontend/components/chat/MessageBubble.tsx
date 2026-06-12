'use client';

import { format } from 'date-fns';
import { useChatStore } from '@/store/chatStore';
import { useState, useRef, useEffect } from 'react';
import { BsChevronDown } from 'react-icons/bs';

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    imageUrl?: string | null;
    createdAt: Date;
    sender: {
      id: string;
      name: string | null;
      image: string | null;
    };
    isDeletedForEveryone?: boolean;
    deletedFor?: string[];
  };
  isOwnMessage: boolean;
  showAvatar: boolean;
  onDeleteMessage?: (messageId: string) => void;
}

export default function MessageBubble({
  message,
  isOwnMessage,
  showAvatar,
  onDeleteMessage,
}: MessageBubbleProps) {
  const { isSelectionMode, selectedMessageIds, toggleMessageSelection, setSelectionMode } = useChatStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const isSelected = selectedMessageIds.includes(message.id);
  const timeString = format(new Date(message.createdAt), 'HH:mm');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div
      onClick={() => {
        if (isSelectionMode && !message.isDeletedForEveryone) {
          toggleMessageSelection(message.id);
        }
      }}
      className={`flex items-center gap-2 message-enter w-full py-0.5 px-2 rounded-lg transition-colors ${
        isOwnMessage ? 'justify-end' : 'justify-start'
      } ${
        isSelectionMode && !message.isDeletedForEveryone
          ? 'cursor-pointer hover:bg-light-hover/30 dark:hover:bg-dark-hover/30'
          : ''
      } ${isSelected ? 'bg-light-hover/50 dark:bg-dark-hover/40' : ''}`}
    >
      {/* Custom WhatsApp-style Checkbox */}
      {isSelectionMode && !message.isDeletedForEveryone && (
        <div className="flex-shrink-0 mr-2">
          {isSelected ? (
            <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-white shadow-sm transition-all scale-105">
              <svg className="w-3.5 h-3.5 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-light-text-secondary/50 dark:border-dark-text-secondary/50 hover:border-accent transition-colors"></div>
          )}
        </div>
      )}

      {/* Spacing for checkboxes if message is deleted for alignment */}
      {isSelectionMode && message.isDeletedForEveryone && (
        <div className="w-5 mr-2"></div>
      )}

      <div className={`flex gap-2 max-w-[75%] md:max-w-[65%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isOwnMessage && (
          <div className="w-8 h-8 flex-shrink-0 mt-auto">
            {showAvatar &&
              (message.sender.image ? (
                <img
                  src={message.sender.image}
                  alt={message.sender.name || 'User'}
                  width={32}
                  height={32}
                  referrerPolicy="no-referrer"
                  className="rounded-full w-8 h-8 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-semibold">
                  {message.sender.name?.[0]?.toUpperCase() || 'U'}
                </div>
              ))}
          </div>
        )}

        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
          {!isOwnMessage && showAvatar && (
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1 px-2">
              {message.sender.name || 'Anonymous'}
            </p>
          )}
          
          <div
            className={`rounded-lg px-3 py-2 relative group/bubble ${
              isOwnMessage
                ? 'bg-light-bubble-sent dark:bg-dark-bubble-sent'
                : 'bg-light-bubble-received dark:bg-dark-bubble-received'
            }`}
          >
            {/* Hover Arrow Trigger */}
            {!isSelectionMode && !message.isDeletedForEveryone && (
              <div className="absolute right-1 top-1 opacity-0 group-hover/bubble:opacity-100 transition-opacity z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(!showDropdown);
                  }}
                  className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-light-text-secondary dark:text-dark-text-secondary"
                >
                  <BsChevronDown className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Dropdown Menu */}
            {showDropdown && (
              <div ref={dropdownRef} className="absolute right-1 top-7 w-36 bg-light-bg dark:bg-dark-sidebar border border-light-border dark:border-dark-border rounded shadow-xl py-1 z-50 text-sm">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectionMode(true);
                    toggleMessageSelection(message.id);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-light-hover dark:hover:bg-dark-hover text-light-text-primary dark:text-dark-text-primary"
                >
                  Select message
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(false);
                    if (onDeleteMessage) {
                      onDeleteMessage(message.id);
                    }
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-light-hover dark:hover:bg-dark-hover text-red-500 font-medium"
                >
                  Delete message
                </button>
              </div>
            )}

            {message.isDeletedForEveryone ? (
              /* Soft-deleted message styling */
              <div className="flex items-center gap-1.5 text-light-text-secondary dark:text-dark-text-secondary/70 italic text-sm">
                <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <span>{isOwnMessage ? 'You deleted this message' : 'This message was deleted'}</span>
              </div>
            ) : (
              /* Normal message styling */
              <>
                {message.imageUrl && (
                  <div className="mb-2 rounded-lg overflow-hidden max-w-[280px]">
                    <img
                      src={message.imageUrl}
                      alt="Shared image"
                      className="max-w-full h-auto object-cover"
                    />
                  </div>
                )}
                <p className="text-light-text-primary dark:text-dark-text-primary break-words whitespace-pre-wrap pr-8 text-sm md:text-base">
                  {message.content}
                </p>
              </>
            )}

            <div className="flex items-center justify-end gap-1 mt-1">
              <span className="text-[9px] text-light-text-secondary dark:text-dark-text-secondary/60">
                {timeString}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

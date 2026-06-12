'use client';

import { format } from 'date-fns';

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
  };
  isOwnMessage: boolean;
  showAvatar: boolean;
}

export default function MessageBubble({
  message,
  isOwnMessage,
  showAvatar,
}: MessageBubbleProps) {
  const timeString = format(new Date(message.createdAt), 'HH:mm');

  return (
    <div
      className={`flex gap-2 message-enter ${
        isOwnMessage ? 'justify-end' : 'justify-start'
      }`}
    >
      {!isOwnMessage && (
        <div className="w-8 h-8 flex-shrink-0">
          {showAvatar &&
            (message.sender.image ? (
              <img
                src={message.sender.image}
                alt={message.sender.name || 'User'}
                width={32}
                height={32}
                className="rounded-full w-8 h-8 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-semibold">
                {message.sender.name?.[0]?.toUpperCase() || 'U'}
              </div>
            ))}
        </div>
      )}

      <div
        className={`max-w-[70%] md:max-w-[60%] ${
          isOwnMessage ? 'items-end' : 'items-start'
        }`}
      >
        {!isOwnMessage && showAvatar && (
          <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1 px-2">
            {message.sender.name || 'Anonymous'}
          </p>
        )}
        
        <div
          className={`rounded-lg px-3 py-2 ${
            isOwnMessage
              ? 'bg-light-bubble-sent dark:bg-dark-bubble-sent'
              : 'bg-light-bubble-received dark:bg-dark-bubble-received'
          }`}
        >
          {message.imageUrl && (
            <div className="mb-2 rounded-lg overflow-hidden">
              <img
                src={message.imageUrl}
                alt="Shared image"
                className="max-w-full h-auto object-cover"
              />
            </div>
          )}
          <p className="text-light-text-primary dark:text-dark-text-primary break-words whitespace-pre-wrap">
            {message.content}
          </p>
          <div className="flex items-center justify-end gap-1 mt-1">
            <span className="text-[10px] text-light-text-secondary dark:text-dark-text-secondary">
              {timeString}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

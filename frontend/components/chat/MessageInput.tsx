'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { BsEmojiSmile, BsImage, BsSend } from 'react-icons/bs';
import { useChatStore } from '@/store/chatStore';
import { socketClient } from '@/lib/socket';
import toast from 'react-hot-toast';
import axios from 'axios';

const EMOJIS = [
  '😊', '😂', '🤣', '😍', '🥰', '😘', '😜', '😎', '🤔', '🤨', '🙄', '😬', '😭', '😱', '😡', '👍',
  '👎', '👏', '🙌', '🙏', '🔥', '🎉', '🌟', '❤️', '💔', '💩', '📷', '📁', '💻', '🤖', '🐶', '🐱',
  '🌸', '🌹', '🍕', '🍺', '☕', '⚽', '🎮', '🚗', '🚀', '💡', '⏰'
];

export default function MessageInput() {
  const { data: session } = useSession();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  
  const { activeConversation, activeGroup } = useChatStore();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleTyping = (value: string) => {
    setMessage(value);

    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      if (activeConversation) {
        socketClient.emit('typing:start', {
          conversationId: activeConversation.id,
          userId: session?.user?.id,
          userName: session?.user?.name,
        });
      } else if (activeGroup) {
        socketClient.emit('group:typing:start', {
          groupId: activeGroup.id,
          userId: session?.user?.id,
          userName: session?.user?.name,
        });
      }
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (activeConversation) {
        socketClient.emit('typing:stop', {
          conversationId: activeConversation.id,
          userId: session?.user?.id,
        });
      } else if (activeGroup) {
        socketClient.emit('group:typing:stop', {
          groupId: activeGroup.id,
          userId: session?.user?.id,
        });
      }
    }, 3000);
  };

  const handleSend = () => {
    if (!message.trim() && selectedImages.length === 0) return;

    // Send one message per image, or one message for text only
    if (selectedImages.length > 0) {
      selectedImages.forEach((imageUrl) => {
        const messageData = {
          content: message.trim(),
          senderId: session?.user?.id,
          imageUrl: imageUrl,
        };

        if (activeConversation) {
          socketClient.emit('message:send', {
            ...messageData,
            conversationId: activeConversation.id,
          });
        } else if (activeGroup) {
          socketClient.emit('group:message:send', {
            ...messageData,
            groupId: activeGroup.id,
          });
        }
      });
    } else if (message.trim()) {
      const messageData = {
        content: message.trim(),
        senderId: session?.user?.id,
        imageUrl: null,
      };

      if (activeConversation) {
        socketClient.emit('message:send', {
          ...messageData,
          conversationId: activeConversation.id,
        });
      } else if (activeGroup) {
        socketClient.emit('group:message:send', {
          ...messageData,
          groupId: activeGroup.id,
        });
      }
    }

    setMessage('');
    setSelectedImages([]);
    setIsTyping(false);
    setShowEmojiPicker(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadToast = toast.loading(`Uploading ${files.length} image(s)...`);
    const uploadedUrls: string[] = [];

    try {
      // Upload all files
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        try {
          // 1. Get signed Cloudinary signature
          const signatureResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/upload/signature`
          );

          const { signature, timestamp, cloudName, apiKey, folder, public_id } = signatureResponse.data;

          // 2. Build form data for direct upload to Cloudinary
          const formData = new FormData();
          formData.append('file', file);
          formData.append('signature', signature);
          formData.append('timestamp', timestamp);
          formData.append('api_key', apiKey);
          formData.append('folder', folder);
          formData.append('public_id', public_id);

          const uploadResponse = await axios.post(
            `https://api.cloudinary.com/v1_1/${cloudName.toLowerCase()}/image/upload`,
            formData
          );

          const secureUrl = uploadResponse.data.secure_url;
          uploadedUrls.push(secureUrl);
        } catch (error) {
          console.error(`Error uploading file ${i + 1}:`, error);
        }
      }

      if (uploadedUrls.length > 0) {
        setSelectedImages((prev) => [...prev, ...uploadedUrls]);
        toast.success(
          `${uploadedUrls.length} image(s) uploaded. Click send to share`,
          { id: uploadToast }
        );
      } else {
        toast.error('Failed to upload images', { id: uploadToast });
      }
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images', { id: uploadToast });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        multiple
        disabled={uploading}
        className="hidden"
      />

      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="absolute bottom-20 left-4 w-72 bg-white/95 dark:bg-dark-sidebar/95 backdrop-blur-md border border-light-border dark:border-dark-border rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-2 font-medium px-1">
            Emoji Picker
          </div>
          <div className="grid grid-cols-7 gap-2 max-h-40 overflow-y-auto">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  setMessage((prev) => prev + emoji);
                }}
                className="text-2xl hover:scale-125 hover:bg-light-hover dark:hover:bg-dark-hover rounded p-1 transition-all duration-100 flex items-center justify-center cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image Preview Gallery */}
      {selectedImages.length > 0 && (
        <div className="bg-light-bg dark:bg-dark-sidebar border-t border-light-border dark:border-dark-border px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} ready to send
            </p>
            <button
              onClick={() => setSelectedImages([])}
              className="text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-red-500 transition-colors"
              aria-label="Clear all images"
            >
              Clear all
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {selectedImages.map((imageUrl, index) => (
              <div
                key={index}
                className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-light-border dark:border-dark-border group"
              >
                <img
                  src={imageUrl}
                  alt={`preview-${index}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() =>
                    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Row */}
      <div className="h-16 bg-light-bg dark:bg-dark-sidebar border-t border-light-border dark:border-dark-border px-4 flex items-center gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="p-2 rounded-full hover:bg-light-hover dark:hover:bg-dark-hover text-light-text-secondary dark:text-dark-text-secondary transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Upload image"
        >
          <BsImage className="w-5 h-5" />
        </button>

        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className={`p-2 rounded-full hover:bg-light-hover dark:hover:bg-dark-hover transition-colors cursor-pointer ${
            showEmojiPicker ? 'text-accent bg-light-hover dark:bg-dark-hover' : 'text-light-text-secondary dark:text-dark-text-secondary'
          }`}
          aria-label="Emoji"
        >
          <BsEmojiSmile className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={message}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg px-4 py-2 text-light-text-primary dark:text-dark-text-primary placeholder-light-text-secondary dark:placeholder-dark-text-secondary focus:outline-none focus:border-accent"
        />

        <button
          onClick={handleSend}
          disabled={!message.trim() && selectedImages.length === 0}
          className={`p-2 rounded-full transition-colors cursor-pointer ${
            (message.trim() || selectedImages.length > 0)
              ? 'bg-accent hover:bg-accent-hover text-white'
              : 'bg-light-hover dark:bg-dark-hover text-light-text-secondary dark:text-dark-text-secondary'
          }`}
          aria-label="Send message"
        >
          <BsSend className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

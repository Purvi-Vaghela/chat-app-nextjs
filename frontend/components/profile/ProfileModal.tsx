'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { BsXLg, BsImage, BsArrowCounterclockwise, BsCheck, BsX } from 'react-icons/bs';
import toast from 'react-hot-toast';
import axios from 'axios';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageUpdate: (imageUrl: string) => void;
}

// Store original Google image URL
let originalGoogleImage: string | null = null;

export default function ProfileModal({ isOpen, onClose, onImageUpdate }: ProfileModalProps) {
  const { data: session, update: updateSession } = useSession();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !session?.user) return null;

  // Store the original Google image on first render
  if (!originalGoogleImage && session.user.image) {
    originalGoogleImage = session.user.image;
  }

  const currentImage = session.user.image;
  const isCustomImage = originalGoogleImage && currentImage !== originalGoogleImage;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview and confirmation
    const preview = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(preview);
    setShowConfirmation(true);
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;
    await handleImageUpload(selectedFile);
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowConfirmation(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    const uploadToast = toast.loading('Uploading profile picture...');

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

      // 3. Update user profile image in backend
      await axios.put(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/users/${session.user.id}/image`,
        { imageUrl: secureUrl }
      );

      // 4. Update NextAuth session
      await updateSession({
        ...session,
        user: {
          ...session.user,
          image: secureUrl,
        },
      });

      onImageUpdate(secureUrl);
      toast.success('Profile picture updated!', { id: uploadToast });
      
      // Reset and close after short delay
      setTimeout(() => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setShowConfirmation(false);
        onClose();
      }, 500);
    } catch (error: any) {
      console.error('Error updating profile picture:', error);
      const errorMsg = error.response?.data?.error?.message || 'Failed to update profile picture';
      toast.error(errorMsg, { id: uploadToast });
      handleCancelUpload();
    } finally {
      setUploading(false);
    }
  };

  const handleResetToGoogle = async () => {
    if (!originalGoogleImage) return;

    setUploading(true);
    const resetToast = toast.loading('Resetting to Google image...');

    try {
      // Update user profile image back to Google image
      await axios.put(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/users/${session.user.id}/image`,
        { imageUrl: originalGoogleImage }
      );

      // Update NextAuth session
      await updateSession({
        ...session,
        user: {
          ...session.user,
          image: originalGoogleImage,
        },
      });

      onImageUpdate(originalGoogleImage);
      toast.success('Profile picture reset to Google image!', { id: resetToast });
      
      // Reset and close after short delay
      setTimeout(() => {
        setPreviewUrl(null);
        onClose();
      }, 500);
    } catch (error: any) {
      console.error('Error resetting profile picture:', error);
      toast.error('Failed to reset profile picture', { id: resetToast });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-sidebar rounded-2xl shadow-xl max-w-sm w-full p-6 border border-light-border dark:border-dark-border">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">
            Profile
          </h2>
          <button
            onClick={onClose}
            disabled={uploading}
            className="p-1 rounded-full hover:bg-light-hover dark:hover:bg-dark-hover text-light-text-secondary dark:text-dark-text-secondary transition-colors disabled:opacity-50"
          >
            <BsXLg className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Info */}
        <div className="space-y-6">
          {/* Current Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              {currentImage && !showConfirmation ? (
                <img
                  src={currentImage}
                  alt={session.user.name || 'User'}
                  className="w-24 h-24 rounded-full object-cover border-4 border-accent"
                  referrerPolicy="no-referrer"
                />
              ) : previewUrl && showConfirmation ? (
                <img
                  src={previewUrl}
                  alt="preview"
                  className="w-24 h-24 rounded-full object-cover border-4 border-accent"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center text-white text-4xl font-semibold border-4 border-accent">
                  {session.user.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              
              {/* Upload Button Overlay - Only show when not in confirmation mode */}
              {!showConfirmation && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center disabled:opacity-75 cursor-pointer"
                  aria-label="Change profile picture"
                >
                  <BsImage className="w-8 h-8 text-white" />
                </button>
              )}
            </div>

            <div className="text-center">
              <p className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
                {session.user.name || 'User'}
              </p>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                {session.user.email}
              </p>
            </div>
          </div>

          {/* Confirmation Message */}
          {showConfirmation ? (
            <div className="bg-accent/10 dark:bg-accent/20 rounded-lg p-4 border border-accent/50">
              <p className="text-sm text-light-text-primary dark:text-dark-text-primary font-medium mb-2">
                Confirm profile picture change?
              </p>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                Are you sure you want to set this as your profile picture?
              </p>
            </div>
          ) : (
            <div className="bg-light-hover dark:bg-dark-hover rounded-lg p-3">
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary text-center">
                Hover over your avatar and click the camera icon to change your profile picture
              </p>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            disabled={uploading}
            className="hidden"
          />

          {/* Action Buttons */}
          <div className="space-y-2">
            {showConfirmation ? (
              <>
                <button
                  onClick={handleConfirmUpload}
                  disabled={uploading}
                  className="w-full bg-accent hover:bg-accent-hover text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <BsCheck className="w-4 h-4" />
                  Confirm
                </button>
                <button
                  onClick={handleCancelUpload}
                  disabled={uploading}
                  className="w-full bg-light-border dark:bg-dark-border hover:bg-light-hover dark:hover:bg-dark-hover text-light-text-primary dark:text-dark-text-primary font-medium py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <BsX className="w-4 h-4" />
                  Cancel
                </button>
              </>
            ) : (
              <>
                {isCustomImage && (
                  <button
                    onClick={handleResetToGoogle}
                    disabled={uploading}
                    className="w-full bg-light-border dark:bg-dark-border hover:bg-light-hover dark:hover:bg-dark-hover text-light-text-primary dark:text-dark-text-primary font-medium py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <BsArrowCounterclockwise className="w-4 h-4" />
                    Reset to Google Image
                  </button>
                )}

                {/* Close Button */}
                <button
                  onClick={onClose}
                  disabled={uploading}
                  className="w-full bg-light-hover dark:bg-dark-hover hover:bg-light-border dark:hover:bg-dark-border text-light-text-primary dark:text-dark-text-primary font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

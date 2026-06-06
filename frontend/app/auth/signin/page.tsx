'use client';

import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';
import { BsChatDots } from 'react-icons/bs';

export default function SignInPage() {
  const handleGoogleSignIn = async () => {
    await signIn('google', { callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent/10 via-light-bg to-accent/5 dark:from-dark-bg dark:via-dark-sidebar dark:to-dark-bg">
      <div className="w-full max-w-md px-6">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-accent rounded-full mb-4 shadow-lg">
            <BsChatDots className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
            ChatApp
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            Connect instantly with friends and groups
          </p>
        </div>

        {/* Sign In Card */}
        <div className="bg-white dark:bg-dark-sidebar rounded-2xl shadow-xl p-8 border border-light-border dark:border-dark-border">
          <h2 className="text-2xl font-semibold text-center mb-6 text-light-text-primary dark:text-dark-text-primary">
            Welcome Back
          </h2>
          
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-dark-bg border-2 border-light-border dark:border-dark-border hover:border-accent dark:hover:border-accent text-light-text-primary dark:text-dark-text-primary font-medium py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-lg group"
          >
            <FcGoogle className="w-6 h-6" />
            <span className="group-hover:text-accent transition-colors">
              Continue with Google
            </span>
          </button>

          <p className="text-xs text-center text-light-text-secondary dark:text-dark-text-secondary mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        {/* Features */}
        <div className="mt-8 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            <div className="w-2 h-2 bg-accent rounded-full"></div>
            <span>Real-time messaging</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            <div className="w-2 h-2 bg-accent rounded-full"></div>
            <span>Group chats & media sharing</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            <div className="w-2 h-2 bg-accent rounded-full"></div>
            <span>Online presence & typing indicators</span>
          </div>
        </div>
      </div>
    </div>
  );
}

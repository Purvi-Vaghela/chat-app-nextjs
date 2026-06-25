'use client';

import { BsChatDots } from 'react-icons/bs';

export default function EmptyChat() {
  return (
    <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-light-chat dark:bg-dark-chat text-light-text-secondary dark:text-dark-text-secondary">
      <div className="text-center max-w-md px-6">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-accent/10 rounded-full mb-6">
          <BsChatDots className="w-12 h-12 text-accent" />
        </div>
        <h2 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
          ChatApp Web
        </h2>
        <p className="text-sm mb-6">
          Send and receive messages instantly. Stay connected with friends and groups.
        </p>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 justify-center">
            <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
            <span>End-to-end encrypted</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
            <span>Real-time messaging</span>
          </div>
        </div>
      </div>
    </div>
  );
}

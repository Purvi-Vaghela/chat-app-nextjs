'use client';

import { useSession, signOut } from 'next-auth/react';
import { BsMoonFill, BsSunFill, BsThreeDotsVertical } from 'react-icons/bs';
import { IoLogOutOutline } from 'react-icons/io5';
import { useTheme } from '@/providers/ThemeProvider';
import { useState, useRef, useEffect } from 'react';

export default function SidebarHeader() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
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

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <div className="h-16 bg-light-bg dark:bg-dark-sidebar border-b border-light-border dark:border-dark-border px-4 flex items-center justify-between">
      {/* User Info */}
      <div className="flex items-center gap-3">
        {session?.user?.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || 'User'}
            width={40}
            height={40}
            className="rounded-full w-10 h-10 object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-semibold">
            {session?.user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
        <div className="hidden md:block">
          <h2 className="font-semibold text-light-text-primary dark:text-dark-text-primary">
            {session?.user?.name || 'User'}
          </h2>
          <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
            Online
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-light-hover dark:hover:bg-dark-hover text-light-text-secondary dark:text-dark-text-secondary transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <BsSunFill className="w-5 h-5" />
          ) : (
            <BsMoonFill className="w-5 h-5" />
          )}
        </button>

        {/* Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full hover:bg-light-hover dark:hover:bg-dark-hover text-light-text-secondary dark:text-dark-text-secondary transition-colors"
            aria-label="Menu"
          >
            <BsThreeDotsVertical className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-sidebar rounded-lg shadow-lg border border-light-border dark:border-dark-border py-2 z-50">
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-light-hover dark:hover:bg-dark-hover text-light-text-primary dark:text-dark-text-primary transition-colors"
              >
                <IoLogOutOutline className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

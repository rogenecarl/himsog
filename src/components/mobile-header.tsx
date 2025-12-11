'use client';

import React from 'react';
import { User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Notification from '@/components/shared/notification';

interface HeaderProps {
  userName: string;
  subtitle?: string;
  userImage?: string | null;
  showGreeting?: boolean;
}

const MobileHeader: React.FC<HeaderProps> = ({
  userName,
  subtitle = "Dashboard",
  userImage,
  showGreeting = true
}) => {
  // Get first name only for cleaner display
  const firstName = userName?.split(' ')[0] || 'User';

  return (
    <header className="flex justify-between items-center px-5 py-4 bg-white/95 dark:bg-[#0B0F19]/95 sticky top-0 z-40 border-b border-gray-100/50 dark:border-white/5 backdrop-blur-md transition-all duration-300">
      <div className="min-w-0 flex-1">
        <p className="text-gray-400 dark:text-slate-500 text-[10px] font-semibold uppercase tracking-widest mb-0.5">
          {subtitle}
        </p>
        {showGreeting ? (
          <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate">
            Hi, {firstName}
          </h1>
        ) : (
          <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate">
            {subtitle}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {/* Notification Component */}
        <div className="[&_button]:h-9 [&_button]:w-9 [&_button]:rounded-xl [&_button]:hover:bg-slate-50 [&_button]:dark:hover:bg-white/5 [&_button]:active:scale-95 [&_button]:transition-all [&_button]:bg-transparent [&_button]:border-0">
          <Notification />
        </div>

        {/* Profile Avatar */}
        <Link
          href="/appointments"
          className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border-2 border-white dark:border-white/10 shadow-sm flex items-center justify-center active:scale-95 transition-transform"
        >
          {userImage ? (
            <Image
              src={userImage}
              alt="Profile"
              width={36}
              height={36}
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={18} className="text-slate-400" />
          )}
        </Link>
      </div>
    </header>
  );
};

export default MobileHeader;
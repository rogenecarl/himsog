"use client";

import { useState } from "react";
import { LogOut, User as UserIcon, ChevronDown, LayoutDashboard } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useSignOut } from "@/hooks/use-auth";
import Image from "next/image";
import Link from "next/link";

export default function AvatarDropdownmenu() {
  const user = useUser();
  const { handleLogout, isLoggingOut } = useSignOut();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-1 pr-3 transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 overflow-hidden">
          {user?.image ? (
            <Image
              src={user.image}
              alt={user?.name || "User"}
              className="w-full h-full object-cover"
              width={32}
              height={32}
            />
          ) : (
            <UserIcon className="h-4 w-4" />
          )}
        </div>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:block">
          {user?.name || "User"}
        </span>
        <ChevronDown
          className={`h-3 w-3 text-slate-400 dark:text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-slate-100 dark:border-white/10 bg-white dark:bg-[#1E293B] p-2 shadow-xl z-20 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-3 py-2 border-b border-slate-100 dark:border-white/10 mb-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {user?.name || "User Name"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.email || "user@example.com"}
              </p>
            </div>
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors"
            >
              <UserIcon className="mr-2 h-4 w-4" />
              Profile
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              disabled={isLoggingOut}
              className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isLoggingOut ? "Logging out..." : "Sign out"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { Separator } from "./ui/separator";
import AvatarDropdownmenu from "./avatar";
import Notification from "./shared/notification";
import { ModeToggle } from "./ui/mode-toggle";
import { useUser } from "@/context/UserContext";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";

export function ClientAppHeader() {
  const user = useUser();
  const { toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center gap-2 sm:gap-4 border-b border-slate-200 dark:border-white/10 px-3 sm:px-4 bg-white dark:bg-[#1E293B]">
      {/* Hamburger Menu */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="size-8 sm:size-9 shrink-0"
      >
        <Menu className="size-5" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>

      {/* Separator - hidden on mobile */}
      <Separator
        orientation="vertical"
        className="hidden sm:block data-[orientation=vertical]:h-4 dark:bg-white/10"
      />

      {/* Content */}
      <div className="flex flex-1 items-center justify-between min-w-0 gap-2">
        {/* Welcome Message - truncated on mobile */}
        {user ? (
          <h1 className="text-sm sm:text-lg lg:text-xl font-semibold text-slate-900 dark:text-white truncate">
            <span className="hidden xs:inline">Welcome, </span>
            <span className="hidden xs:inline">Hi,  {user.name}</span>
          </h1>
        ) : (
          <Skeleton className="h-5 sm:h-7 w-24 sm:w-48 bg-slate-200 dark:bg-white/10" />
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 shrink-0">
          <ModeToggle />
          <Notification />
          <AvatarDropdownmenu />
        </div>
      </div>
    </header>
  );
}

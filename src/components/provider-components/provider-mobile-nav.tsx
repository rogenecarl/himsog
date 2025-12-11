"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  Calendar,
  Layers,
  MoreHorizontal,
  Star,
  BarChart3,
  Settings,
  MessageSquare,
  LogOut,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDashboardStats } from "@/hooks/use-provider-dashboard";
import { useNotifications } from "@/hooks/use-notification-hook";
import { useSignOut } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";

const mainNavItems = [
  { name: "Dashboard", href: "/provider/dashboard", icon: LayoutDashboard },
  { name: "Appointments", href: "/provider/appointments", icon: Clock },
  { name: "Calendar", href: "/provider/calendar", icon: Calendar },
  { name: "Services", href: "/provider/services", icon: Layers },
];

const moreNavItems = [
  { name: "Reviews", href: "/provider/reviews", icon: Star },
  { name: "Analytics", href: "/provider/analytics", icon: BarChart3 },
  { name: "Messages", href: "/chat", icon: MessageSquare },
  { name: "Settings", href: "/provider/settings", icon: Settings },
];

// Badge component for notification dots
function NavBadge({ count, small = false }: { count: number; small?: boolean }) {
  if (count === 0) return null;

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cn(
        "absolute flex items-center justify-center rounded-full bg-cyan-500 text-white font-bold",
        small
          ? "-top-0.5 -right-0.5 h-2 w-2"
          : "-top-1 -right-1 h-4 min-w-4 px-1 text-[9px]"
      )}
    >
      {!small && (count > 9 ? "9+" : count)}
    </motion.span>
  );
}

export function ProviderMobileNav() {
  const pathname = usePathname();
  const { data: stats } = useDashboardStats();
  const { unreadCount } = useNotifications();
  const { handleLogout, isLoggingOut } = useSignOut();

  const isActive = (href: string) => {
    if (href === "/provider/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const isMoreActive = moreNavItems.some((item) => isActive(item.href));

  // Get badge count for items
  const getBadgeCount = (href: string): number => {
    switch (href) {
      case "/provider/appointments":
        return stats?.pendingAppointments || 0;
      case "/chat":
        return unreadCount || 0;
      default:
        return 0;
    }
  };

  // Check if any "more" items have badges
  const moreHasBadge = moreNavItems.some((item) => getBadgeCount(item.href) > 0);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-xl border-t border-slate-200 dark:border-white/10" />

      {/* Content */}
      <div className="relative flex items-center justify-around h-16 px-2 pb-[env(safe-area-inset-bottom)]">
        {mainNavItems.map((item) => {
          const active = isActive(item.href);
          const badgeCount = getBadgeCount(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 flex-1 h-full px-1 transition-all duration-200",
                active
                  ? "text-cyan-600 dark:text-cyan-400"
                  : "text-slate-500 dark:text-slate-400"
              )}
            >
              {/* Active indicator */}
              <AnimatePresence>
                {active && (
                  <motion.div
                    layoutId="mobileNavIndicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-cyan-500 rounded-b-full"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </AnimatePresence>

              <div className="relative">
                <item.icon
                  className={cn(
                    "size-5 transition-transform duration-200",
                    active && "scale-110"
                  )}
                />
                <NavBadge count={badgeCount} />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium truncate transition-all duration-200",
                  active && "font-semibold"
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}

        {/* More dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 flex-1 h-full px-1 transition-all duration-200 outline-none",
                isMoreActive
                  ? "text-cyan-600 dark:text-cyan-400"
                  : "text-slate-500 dark:text-slate-400"
              )}
            >
              {/* Active indicator for more menu */}
              <AnimatePresence>
                {isMoreActive && (
                  <motion.div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-cyan-500 rounded-b-full"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </AnimatePresence>

              <div className="relative">
                <MoreHorizontal
                  className={cn(
                    "size-5 transition-transform duration-200",
                    isMoreActive && "scale-110"
                  )}
                />
                {moreHasBadge && <NavBadge count={1} small />}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium",
                  isMoreActive && "font-semibold"
                )}
              >
                More
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="top"
            className="w-56 mb-2 rounded-xl bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10 shadow-xl"
            sideOffset={8}
          >
            {moreNavItems.map((item) => {
              const active = isActive(item.href);
              const badgeCount = getBadgeCount(item.href);

              return (
                <DropdownMenuItem key={item.href} asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg mx-1 my-0.5",
                      active
                        ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 font-medium"
                        : "text-slate-700 dark:text-slate-300"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg relative",
                        active
                          ? "bg-cyan-100 dark:bg-cyan-900/30"
                          : "bg-slate-100 dark:bg-slate-800"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "size-4",
                          active
                            ? "text-cyan-600 dark:text-cyan-400"
                            : "text-slate-600 dark:text-slate-400"
                        )}
                      />
                      {badgeCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 min-w-4 flex items-center justify-center rounded-full bg-cyan-500 text-white text-[9px] font-bold px-1">
                          {badgeCount > 9 ? "9+" : badgeCount}
                        </span>
                      )}
                    </div>
                    <span className="flex-1">{item.name}</span>
                    {active && (
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    )}
                  </Link>
                </DropdownMenuItem>
              );
            })}

            <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/10 my-1" />

            {/* Logout option */}
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg mx-1 my-0.5 text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                {isLoggingOut ? (
                  <Loader2 className="size-4 animate-spin text-red-600 dark:text-red-400" />
                ) : (
                  <LogOut className="size-4 text-red-600 dark:text-red-400" />
                )}
              </div>
              <span className="flex-1">
                {isLoggingOut ? "Logging out..." : "Log out"}
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}

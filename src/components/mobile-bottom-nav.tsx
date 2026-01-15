"use client";

import { Home, Search, CalendarDays, MessageCircle, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Search", href: "/browse-services", icon: Search },
  { name: "Appointments", href: "/appointments", icon: CalendarDays },
  { name: "Messages", href: "/chat", icon: MessageCircle },
  { name: "Profile", href: "/profile", icon: User },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  const getIsActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    if (href === "/browse-services") {
      return (
        pathname === "/browse-services" ||
        pathname.startsWith("/provider-details") ||
        pathname.startsWith("/set-appointment") ||
        pathname === "/map"
      );
    }
    if (href === "/appointments") {
      return pathname === "/appointments" || pathname.startsWith("/appointments/");
    }
    if (href === "/chat") {
      return pathname === "/chat" || pathname.startsWith("/chat/");
    }
    if (href === "/profile") {
      return pathname === "/profile" || pathname.startsWith("/profile/");
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = getIsActive(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center min-w-[64px] h-full py-2 px-3 -mx-1 rounded-lg active:bg-slate-100 dark:active:bg-slate-800 transition-colors"
              aria-label={item.name}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-colors duration-150 ${
                    isActive
                      ? "text-teal-600 dark:text-teal-400"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                  strokeWidth={isActive ? 2.25 : 1.75}
                />
                {isActive && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-teal-600 dark:bg-teal-400" />
                )}
              </div>
              <span
                className={`mt-1 text-[11px] font-medium transition-colors duration-150 ${
                  isActive
                    ? "text-teal-600 dark:text-teal-400"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

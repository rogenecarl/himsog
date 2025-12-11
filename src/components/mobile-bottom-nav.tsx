"use client";

import { Home, Map, MessageCircle, User, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Services", href: "/browse-services", icon: LayoutGrid },
    { name: "Map", href: "/map", icon: Map },
    { name: "Messages", href: "/chat", icon: MessageCircle },
    { name: "Profile", href: "/appointments", icon: User },
  ];

  // Determine active nav based on current pathname
  const getIsActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    if (href === "/browse-services") {
      return pathname === "/browse-services" || pathname.startsWith("/provider-details") || pathname.startsWith("/set-appointment");
    }
    if (href === "/chat") {
      return pathname === "/chat" || pathname.startsWith("/chat/");
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-md border-t border-gray-100 dark:border-white/10 z-50 shadow-lg transition-colors duration-300 safe-area-pb">
      <nav className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = getIsActive(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-2 px-4 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-teal-600 dark:text-cyan-400"
                  : "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 active:scale-95"
              }`}
              aria-label={item.name}
            >
              <div className={`relative ${isActive ? "scale-110" : ""} transition-transform duration-200`}>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-teal-600 dark:bg-cyan-400 rounded-full" />
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? "font-semibold" : ""}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

"use client";

import { Home, Map, MessageCircle, User, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const navItems = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Map", href: "/map", icon: Map },
  { name: "Search", href: "/browse-services", icon: Search, isCenter: true },
  { name: "Chat", href: "/chat", icon: MessageCircle },
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
        pathname.startsWith("/set-appointment")
      );
    }
    if (href === "/chat") {
      return pathname === "/chat" || pathname.startsWith("/chat/");
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe">
      <div className="mb-2">
        <nav className="relative flex items-center justify-between h-[68px] max-w-md mx-auto px-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/20 dark:border-white/10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = getIsActive(item.href);

            if (item.isCenter) {
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative -mt-5"
                  aria-label={item.name}
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    className="relative"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 dark:from-teal-400 dark:to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/30 dark:shadow-teal-400/20">
                      <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="centerGlow"
                        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 blur-xl opacity-40"
                        initial={false}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </motion.div>
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-teal-600 dark:text-teal-400 whitespace-nowrap">
                    {item.name}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className="relative flex flex-col items-center justify-center w-16 h-full"
                aria-label={item.name}
              >
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  className="relative flex flex-col items-center gap-1"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeBackground"
                      className="absolute -inset-x-2 -inset-y-1 bg-teal-50 dark:bg-teal-500/10 rounded-xl"
                      initial={false}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <motion.div
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      y: isActive ? -2 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="relative z-10"
                  >
                    <Icon
                      className={`w-[22px] h-[22px] transition-colors duration-200 ${
                        isActive
                          ? "text-teal-600 dark:text-teal-400"
                          : "text-slate-400 dark:text-slate-500"
                      }`}
                      strokeWidth={isActive ? 2.5 : 2}
                      fill={isActive ? "currentColor" : "none"}
                      fillOpacity={isActive ? 0.15 : 0}
                    />
                  </motion.div>
                  <motion.span
                    animate={{
                      opacity: isActive ? 1 : 0.7,
                      y: isActive ? 0 : 2,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={`relative z-10 text-[10px] font-medium transition-colors duration-200 ${
                      isActive
                        ? "text-teal-600 dark:text-teal-400"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {item.name}
                  </motion.span>
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

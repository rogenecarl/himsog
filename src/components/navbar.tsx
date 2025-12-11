"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clipboard,
  GalleryVertical,
  Home,
  LayoutDashboard,
  Map as MapIcon,
  User as UserIcon,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import Logo from "./logo";
import Notification from "./shared/notification";
import AvatarDropdownmenu from "./avatar";
import { useSignOut } from "@/hooks/use-auth";
import { ModeToggle } from "./ui/mode-toggle";

type NavLink = {
  name: string;
  href: string;
  icon?: React.ElementType;
};

export default function Navbar() {
  const user = useUser();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { handleLogout, isLoggingOut } = useSignOut();
  const [, setIsOpen] = useState(false);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navigation links for logged-in users
  const userNavLinks: NavLink[] = [
    { name: "My Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Home", href: "/", icon: Home },
    {
      name: "Browse Services",
      href: "/browse-services",
      icon: GalleryVertical,
    },
    { name: "Map", href: "/map", icon: MapIcon },
    { name: "How It Works", href: "/how-it-works", icon: Clipboard },
    // { name: "For Providers", href: "/provider", icon: UserIcon },
  ];

  // Navigation links for non-logged-in users
  const guestNavLinks: NavLink[] = [
    { name: "Home", href: "/" },
    { name: "Browse Services", href: "/browse-services" },
    { name: "Map", href: "/map" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "About Us", href: "/about-us" },
  ];

  const navLinks = user ? userNavLinks : guestNavLinks;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? "bg-white/70 dark:bg-[#0B0F19]/70 backdrop-blur-xl border-slate-200/50 dark:border-white/5 py-3"
          : "bg-transparent border-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <Logo />
        </div>

        {/* Desktop Nav - The "Pill" Design */}
        <nav className="hidden md:flex items-center gap-1 bg-white/50 dark:bg-white/5 rounded-full px-2 py-1 border border-black/5 dark:border-white/5 backdrop-blur-sm">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 text-sm font-medium transition-all px-4 py-2 rounded-full ${
                  isActive
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                {/* Optional: Hide icons on desktop to match the clean design, or keep them small */}
                {user && Icon && (
                  <Icon className={`h-4 w-4 ${isActive ? "text-white dark:text-slate-900" : "text-current"}`} />
                )}
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ModeToggle />

          <div className="h-6 w-px bg-slate-200 dark:bg-white/20 mx-1"></div>

          {user ? (
            <>
              <Notification />
              <AvatarDropdownmenu />
            </>
          ) : (
            <>
              <Link href="/auth/sign-in">
                <button className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                  Login
                </button>
              </Link>
              <Link href="/auth/choose-role">
                <button className="bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold px-5 py-2.5 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 cursor-pointer">
                  Get Started
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-4 md:hidden">
          <ModeToggle />
          <button
            className="text-slate-900 dark:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Animated */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 overflow-hidden"
          >
            <nav className="flex flex-col p-4 gap-2">
              {/* User Info Mobile */}
              {user && (
                <div className="mb-2 flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-white/5 p-3 border border-slate-100 dark:border-white/5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {user.name || "User"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {user.email || "user@example.com"}
                    </p>
                  </div>
                </div>
              )}

              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-medium"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                    }`}
                  >
                    {Icon && (
                      <Icon className={`h-5 w-5 ${isActive ? "text-slate-900 dark:text-white" : "text-slate-400"}`} />
                    )}
                    {link.name}
                  </Link>
                );
              })}

              <div className="h-px bg-slate-100 dark:bg-white/10 my-2"></div>

              {/* Mobile Actions */}
              {!user ? (
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/auth/sign-in" onClick={() => setMobileMenuOpen(false)} className="w-full">
                    <button className="w-full text-slate-600 dark:text-slate-300 font-medium py-3 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5">
                      Login
                    </button>
                  </Link>
                  <Link href="/auth/choose-role" onClick={() => setMobileMenuOpen(false)} className="w-full">
                    <button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium py-3 rounded-lg shadow-lg">
                      Register
                    </button>
                  </Link>
                </div>
              ) : (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                    setMobileMenuOpen(false);
                  }}
                  disabled={isLoggingOut}
                  className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 border border-transparent hover:border-red-100 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  {isLoggingOut ? "Logging out..." : "Sign out"}
                </button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
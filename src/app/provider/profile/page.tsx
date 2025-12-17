"use client";

import { useState } from "react";
import { User, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/UserContext";

// Profile components (shared)
import { ProfileForm } from "@/components/users/profile/profile-form";
import { PasswordForm } from "@/components/users/profile/password-form";

type TabValue = "profile" | "password";

const tabs = [
  {
    value: "profile" as const,
    label: "Profile",
    icon: User,
    description: "Update your personal information",
  },
  {
    value: "password" as const,
    label: "Password",
    icon: Lock,
    description: "Change your password",
  },
];

export default function ProviderProfilePage() {
  const user = useUser();
  const [activeTab, setActiveTab] = useState<TabValue>("profile");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19]">
      {/* Header */}
      <header>
        <div className="max-w-5xl mx-auto py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Account Settings
          </h1>
          <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">
            Manage your account settings and preferences
          </p>
        </div>
      </header>

      {/* Main Content with Vertical Tabs */}
      <main className="max-w-5xl mx-auto pb-12">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Vertical Tab List - Desktop */}
          <nav className="hidden md:block w-64 shrink-0">
            <div className="sticky top-6 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all",
                      activeTab === tab.value
                        ? "bg-white dark:bg-[#1E293B] text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-white/10"
                        : "text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-[#1E293B]/50 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        activeTab === tab.value
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                          : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{tab.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {tab.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Horizontal Tabs - Mobile */}
          <div className="md:hidden px-4">
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-[#1E293B] rounded-xl">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all",
                      activeTab === tab.value
                        ? "bg-white dark:bg-[#0B0F19] text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 min-w-0 px-4 md:px-0">
            {activeTab === "profile" && <ProfileForm />}
            {activeTab === "password" && <PasswordForm />}
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import { User, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/UserContext";

// Mobile components
import MobileHeader from "@/components/mobile-header";
import BottomNavigation from "@/components/mobile-bottom-nav";

// Profile components
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

export default function ProfilePage() {
  const user = useUser();
  const [activeTab, setActiveTab] = useState<TabValue>("profile");

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden min-h-screen bg-gray-50 dark:bg-[#0B0F19]">
        <MobileHeader
          userName={user?.name || "User"}
          subtitle="Settings"
          userImage={user?.image}
        />

        {/* Mobile Tabs */}
        <div className="px-5 py-4">
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

        {/* Mobile Content */}
        <div className="px-5 pb-32">
          {activeTab === "profile" && <ProfileForm />}
          {activeTab === "password" && <PasswordForm />}
        </div>

        <BottomNavigation />
      </div>

      {/* Desktop View */}
      <div className="hidden md:block min-h-screen bg-gray-50 dark:bg-[#0B0F19]">
        {/* Header */}
        <header>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Account Settings
            </h1>
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">
              Manage your account settings and preferences
            </p>
          </div>
        </header>

        {/* Main Content with Vertical Tabs */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
          <div className="flex gap-8">
            {/* Vertical Tab List */}
            <nav className="w-64 shrink-0">
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
                            ? "bg-primary/10 text-primary"
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

            {/* Tab Content */}
            <div className="flex-1 min-w-0">
              {activeTab === "profile" && <ProfileForm />}
              {activeTab === "password" && <PasswordForm />}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

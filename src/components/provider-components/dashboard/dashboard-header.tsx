"use client";

import { useState, useEffect } from "react";
import { Calendar, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Provider {
  user?: {
    name?: string;
  };
}

interface DashboardHeaderProps {
  provider?: Provider | null;
  isLoading?: boolean;
}

export function DashboardHeader({ provider, isLoading }: DashboardHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return <DashboardHeaderSkeleton />;
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex-1">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-1">
          Overview
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Welcome back,{" "}
          <span className="font-semibold text-slate-900 dark:text-white">
            {provider?.user?.name || "Provider"}
          </span>
          ! Manage your profile overview.
        </p>
      </div>

      {/* Date and Time Display - Hidden on mobile */}
      <div className="hidden sm:flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900/30">
            <Calendar className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Date
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {currentTime.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Time
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
              {currentTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardHeaderSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32 bg-slate-200 dark:bg-white/10" />
        <Skeleton className="h-4 w-64 bg-slate-200 dark:bg-white/10" />
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full bg-slate-200 dark:bg-white/10" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-8 bg-slate-200 dark:bg-white/10" />
            <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-white/10" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full bg-slate-200 dark:bg-white/10" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-8 bg-slate-200 dark:bg-white/10" />
            <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

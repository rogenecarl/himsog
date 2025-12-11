"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStatsGridSkeleton } from "../skeletons/dashboard-stats-skeleton";
import { useDashboardStats } from "@/hooks/use-provider-dashboard";
import {
  Calendar,
  Star,
  Activity,
  Layers,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const statsConfig = [
  {
    key: "todayAppointments",
    label: "Today's Appointments",
    icon: Calendar,
    color: "text-blue-500 dark:text-blue-400",
    borderColor: "border-l-blue-500 dark:border-l-blue-400",
    subtitle: "scheduled for today",
  },
  {
    key: "pendingAppointments",
    label: "Pending Approvals",
    icon: Activity,
    color: "text-yellow-500 dark:text-yellow-400",
    borderColor: "border-l-yellow-500 dark:border-l-yellow-400",
    subtitle: "awaiting confirmation",
  },
  {
    key: "totalServices",
    label: "Active Services",
    icon: Layers,
    color: "text-green-500 dark:text-green-400",
    borderColor: "border-l-green-500 dark:border-l-green-400",
    subtitle: "services offered",
  },
  {
    key: "rating",
    label: "Rating",
    icon: Star,
    color: "text-orange-500 dark:text-orange-400",
    borderColor: "border-l-orange-500 dark:border-l-orange-400",
    subtitle: "average rating",
  },
] as const;

export function DashboardStats() {
  const { data: stats, isLoading, isError, error, refetch } = useDashboardStats();

  // Loading state
  if (isLoading) {
    return <DashboardStatsGridSkeleton count={4} />;
  }

  // Error state
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Failed to load dashboard stats: {error?.message}</span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Success state
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsConfig.map(
        ({ key, label, icon: Icon, color, borderColor, subtitle }) => (
          <Card
            key={key}
            className={`border-l-4 ${borderColor} bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {label}
              </CardTitle>
              <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {key === "rating"
                  ? stats?.[key] && stats[key] > 0
                    ? stats[key].toFixed(1)
                    : "N/A"
                  : stats?.[key]?.toLocaleString() ?? 0}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {key === "rating" && stats?.totalReviews
                  ? `${stats.totalReviews} ${stats.totalReviews === 1 ? "review" : "reviews"}`
                  : subtitle}
              </p>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}

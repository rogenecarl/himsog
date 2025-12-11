"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCardsGridSkeleton } from "../skeletons/stats-card-skeleton";
import { useDashboardStats } from "@/hooks/use-admin-dashboard";
import {
  Users,
  Building2,
  Clock,
  CheckCircle,
  Briefcase,
  TrendingUp,
  AlertCircle,
  FolderOpen,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const statsConfig = [
  // Row 1: User & Provider counts
  {
    key: "totalUsers",
    label: "Total Users",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    key: "totalProviders",
    label: "Total Providers",
    icon: Building2,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    key: "pendingProviders",
    label: "Pending Verification",
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  {
    key: "verifiedProviders",
    label: "Verified Providers",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  // Row 2: Platform activity metrics
  {
    key: "totalCategories",
    label: "Total Categories",
    icon: FolderOpen,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
  {
    key: "totalServices",
    label: "Total Services",
    icon: Briefcase,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
];

export function StatsCards() {
  const { data: stats, isLoading, isError, error, refetch } = useDashboardStats();

  // Loading state
  if (isLoading) {
    return <StatsCardsGridSkeleton count={7} />;
  }

  // Error state
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Failed to load dashboard stats: {error?.message}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="ml-2"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Success state
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsConfig.map(({ key, label, icon: Icon, color, bgColor }) => (
        <Card key={key} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {label}
            </CardTitle>
            <div className={`p-2 rounded-full ${bgColor}`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                stats?.[key as keyof typeof stats] as number | undefined
              )?.toLocaleString() ?? 0}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* New This Week Card - Special styling */}
      <Card className="hover:shadow-md transition-shadow border-emerald-200 bg-emerald-50/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            New This Week
          </CardTitle>
          <div className="p-2 rounded-full bg-emerald-100">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-700">
            +
            {(
              (stats?.newThisWeek?.users ?? 0) +
              (stats?.newThisWeek?.providers ?? 0)
            ).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats?.newThisWeek?.users ?? 0} users,{" "}
            {stats?.newThisWeek?.providers ?? 0} providers
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

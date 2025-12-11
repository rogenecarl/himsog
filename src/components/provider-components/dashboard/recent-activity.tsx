"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityFeedSkeleton } from "../skeletons/activity-skeleton";
import { useRecentActivities } from "@/hooks/use-provider-dashboard";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  RefreshCw,
  Calendar,
  Star,
  MessageCircle,
  Activity,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const activityIcons = {
  BOOKING: Calendar,
  REVIEW: Star,
  MESSAGE: MessageCircle,
};

const activityColors = {
  BOOKING: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  REVIEW: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
  MESSAGE: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
};

export function RecentActivity() {
  const {
    data: activities,
    isLoading,
    isError,
    error,
    refetch,
  } = useRecentActivities(10);

  // Loading state
  if (isLoading) {
    return <ActivityFeedSkeleton count={5} />;
  }

  // Error state
  if (isError) {
    return (
      <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error?.message}</span>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!activities || activities.length === 0) {
    return (
      <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white">
            <Activity className="h-5 w-5 text-cyan-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">No recent activity</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
              Your appointments, reviews, and messages will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Success state
  return (
    <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white">
          <Activity className="h-5 w-5 text-cyan-500" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-slate-100 dark:divide-white/5">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.type];
          const colorClass = activityColors[activity.type];

          return (
            <div key={activity.id} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
              <div className={`p-2 rounded-full ${colorClass} flex-shrink-0`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {activity.title}
                </p>
                {activity.description && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {activity.description}
                  </p>
                )}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                {formatDistanceToNow(new Date(activity.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ActivityFeedSkeleton } from "../skeletons/activity-skeleton";
import { useRecentActivities } from "@/hooks/use-admin-dashboard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Activity, User, Building2, FolderTree, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

// Map action types to icons and colors
const actionConfig: Record<
  string,
  { icon: React.ElementType; color: string; bgColor: string }
> = {
  PROVIDER_STATUS_CHANGED: {
    icon: Building2,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  PROVIDER_DOCUMENT_VERIFIED: {
    icon: FileText,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  PROVIDER_DOCUMENT_REJECTED: {
    icon: FileText,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  USER_ROLE_CHANGED: {
    icon: User,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  USER_SUSPENDED: {
    icon: User,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  USER_REACTIVATED: {
    icon: User,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  CATEGORY_CREATED: {
    icon: FolderTree,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  CATEGORY_UPDATED: {
    icon: FolderTree,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  CATEGORY_DELETED: {
    icon: FolderTree,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  SETTINGS_UPDATED: {
    icon: Settings,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
};

// Format action for display
function formatAction(action: string): string {
  return action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface RecentActivityProps {
  limit?: number;
}

export function RecentActivity({ limit = 10 }: RecentActivityProps) {
  const { data: activities, isLoading, isError, error, refetch } = useRecentActivities(limit);

  // Loading state
  if (isLoading) {
    return <ActivityFeedSkeleton count={5} />;
  }

  // Error state
  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load activities: {error?.message}</span>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest admin actions</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!activities || activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          <ScrollArea className="h-[350px] pr-4">
            <div className="space-y-1">
              {activities.map((activity) => {
                const config = actionConfig[activity.action] || {
                  icon: Activity,
                  color: "text-gray-600",
                  bgColor: "bg-gray-100",
                };
                const Icon = config.icon;

                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 py-3 border-b last:border-0"
                  >
                    <div className={`p-2 rounded-full ${config.bgColor} flex-shrink-0`}>
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {formatAction(activity.action)}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.targetType} #{activity.targetId.slice(0, 8)}...
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={activity.admin?.image || undefined} />
                        <AvatarFallback className="text-xs">
                          {activity.admin?.name?.charAt(0) || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(activity.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

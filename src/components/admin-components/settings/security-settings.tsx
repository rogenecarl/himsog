"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertCircle,
  RefreshCw,
  Shield,
  Key,
  UserCog,
  Clock,
} from "lucide-react";
import { useAdminUsers, useAuditLogStats } from "@/hooks/use-admin-settings";

// ============================================================================
// ADMIN USERS LIST
// ============================================================================

function AdminUsersList() {
  const { data: admins, isLoading, isError, refetch } = useAdminUsers();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 bg-slate-200 dark:bg-white/10" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
              <Skeleton className="h-10 w-10 rounded-full bg-slate-200 dark:bg-white/10" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32 bg-slate-200 dark:bg-white/10" />
                <Skeleton className="h-3 w-48 bg-slate-200 dark:bg-white/10" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Admin Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load admin users</span>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog className="h-5 w-5" />
          Admin Users
        </CardTitle>
        <CardDescription>
          Users with administrative access to the platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {admins?.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No admin users found
          </p>
        ) : (
          admins?.map((admin) => (
            <div
              key={admin.id}
              className="flex items-center gap-4 p-4 border rounded-lg"
            >
              <Avatar>
                <AvatarImage src={admin.image ?? undefined} />
                <AvatarFallback>
                  {admin.name?.charAt(0).toUpperCase() ?? "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{admin.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {admin.email}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// AUDIT ACTIVITY SUMMARY
// ============================================================================

function AuditActivitySummary() {
  const { data, isLoading, isError, refetch } = useAuditLogStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32 bg-slate-200 dark:bg-white/10" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-white/10" />
                <Skeleton className="h-6 w-16 bg-slate-200 dark:bg-white/10" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audit Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load audit stats</span>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Audit Activity Summary
        </CardTitle>
        <CardDescription>Overview of admin actions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Audit Logs</p>
            <p className="text-2xl font-semibold">
              {data?.totalLogs.toLocaleString() ?? 0}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Action Types</p>
            <p className="text-2xl font-semibold">
              {data?.actionDistribution.length ?? 0}
            </p>
          </div>
        </div>

        {data?.actionDistribution && data.actionDistribution.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Top Actions</p>
            <div className="space-y-2">
              {data.actionDistribution.slice(0, 5).map((item) => (
                <div
                  key={item.action}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground truncate">
                    {item.action.replace(/_/g, " ")}
                  </span>
                  <Badge variant="outline">{item.count}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {data?.recentAdmins && data.recentAdmins.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Recent Active Admins</p>
            <div className="flex -space-x-2">
              {data.recentAdmins.map((admin) => (
                <Avatar
                  key={admin.id}
                  className="h-8 w-8 border-2 border-background"
                >
                  <AvatarImage src={admin.image ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {admin.name?.charAt(0).toUpperCase() ?? "A"}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// SECURITY INFO CARD
// ============================================================================

function SecurityInfoCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Security Information
        </CardTitle>
        <CardDescription>
          Platform security settings and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <p className="font-medium">Authentication Provider</p>
            <p className="text-sm text-muted-foreground">Better Auth</p>
          </div>
          <Badge className="bg-green-100 text-green-800">Active</Badge>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <p className="font-medium">Session Management</p>
            <p className="text-sm text-muted-foreground">
              Sessions expire after 7 days of inactivity
            </p>
          </div>
          <Badge variant="secondary">Configured</Badge>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <p className="font-medium">Audit Logging</p>
            <p className="text-sm text-muted-foreground">
              All admin actions are logged
            </p>
          </div>
          <Badge className="bg-green-100 text-green-800">Enabled</Badge>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900">
          <div className="space-y-0.5">
            <p className="font-medium text-yellow-800 dark:text-yellow-200">
              Two-Factor Authentication
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Not yet implemented - Recommended for admin accounts
            </p>
          </div>
          <Badge variant="outline" className="border-yellow-600 text-yellow-700">
            Planned
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SecuritySettings() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <AdminUsersList />
        <AuditActivitySummary />
      </div>
      <SecurityInfoCard />
    </div>
  );
}

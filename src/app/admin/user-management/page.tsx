"use client";

import { UserTable } from "@/components/admin-components/user-management";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserStatistics } from "@/hooks/use-admin-users";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCheck } from "lucide-react";

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  isLoading,
}: {
  title: string;
  value: number | undefined;
  icon: React.ElementType;
  color: string;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-2xl font-bold">
            {value?.toLocaleString() ?? 0}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function UserManagementPage() {
  const { data: stats, isLoading } = useUserStatistics();

  return (
    <div className="flex-1 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and account statuses
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers}
          icon={Users}
          color="text-blue-600"
          isLoading={isLoading}
        />
        <StatCard
          title="Active Users"
          value={stats?.activeUsers}
          icon={UserCheck}
          color="text-green-600"
          isLoading={isLoading}
        />
        {/* <StatCard
          title="Deleted Users"
          value={stats?.deletedUsers}
          icon={UserMinus}
          color="text-gray-600"
          isLoading={isLoading}
        /> */}
      </div>

      {/* User Table */}
      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <UserTable />
        </div>
      </div>
    </div>
  );
}

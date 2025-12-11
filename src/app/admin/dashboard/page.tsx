"use client";

import { StatsCards } from "@/components/admin-components/dashboard/stats-cards";
import { PendingActions } from "@/components/admin-components/dashboard/pending-actions";
import { RecentActivity } from "@/components/admin-components/dashboard/recent-activity";

export default function AdminDashboardPage() {
  return (
    <div className="flex-1 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your platform&apos;s performance
          </p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <StatsCards />

      {/* Actions and Activity Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <PendingActions />
        <RecentActivity />
      </div>
    </div>
  );
}
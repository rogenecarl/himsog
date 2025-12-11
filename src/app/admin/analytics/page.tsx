"use client";

import { useState } from "react";
import { subDays } from "date-fns";
import { DateRangePicker } from "@/components/admin-components/analytics/date-range-picker";
import { useAdminDashboardAnalytics } from "@/hooks/use-admin-analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  CalendarCheck,
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { DateRange as DayPickerDateRange } from "react-day-picker";
import type { DateRange as ActionDateRange } from "@/actions/admin/analytics-actions";

// Import chart components
import ServiceTrendsChart from "@/components/admin-components/analytics/service-trends-chart";
import TopProvidersChart from "@/components/admin-components/analytics/top-providers-chart";
import TopServicesChart from "@/components/admin-components/analytics/top-services-chart";
import PeakTimesChart from "@/components/admin-components/analytics/peak-times-chart";

// Import table components
import ProviderPerformanceTable from "@/components/admin-components/analytics/tables/provider-performance-table";
import ActiveUsersList from "@/components/admin-components/analytics/tables/active-users-list";

// KPI Card Component
interface KPICardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon: React.ElementType;
  colorClass: string;
}

function KPICard({ title, value, trend, icon: Icon, colorClass }: KPICardProps) {
  return (
    <Card className="p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mt-2">
            {typeof value === "number" ? value.toLocaleString() : value}
          </h3>
          {trend !== undefined && (
            <div
              className={`flex items-center gap-1 mt-2 text-sm font-medium ${
                trend >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {trend >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>
                {trend >= 0 ? "+" : ""}
                {trend}% vs last period
              </span>
            </div>
          )}
        </div>
        <div
          className={`p-3 rounded-xl ${colorClass} text-white flex-shrink-0`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [datePickerRange, setDatePickerRange] = useState<
    DayPickerDateRange | undefined
  >({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  // Convert to the format expected by analytics actions
  const analyticsDateRange: ActionDateRange = {
    from: datePickerRange?.from ?? subDays(new Date(), 30),
    to: datePickerRange?.to ?? new Date(),
  };

  // Fetch analytics data
  const { data: analyticsData, isLoading } =
    useAdminDashboardAnalytics(analyticsDateRange);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Admin Analytics
            </h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-slate-400 mt-1">
              Platform insights and performance metrics
            </p>
          </div>
          <DateRangePicker
            dateRange={datePickerRange}
            onDateRangeChange={setDatePickerRange}
          />
        </div>

        {/* KPI Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card
                key={i}
                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              >
                <CardHeader className="p-4 pb-2">
                  <Skeleton className="h-4 w-32 bg-slate-200 dark:bg-slate-700" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Skeleton className="h-8 w-20 bg-slate-200 dark:bg-slate-700" />
                  <Skeleton className="h-4 w-24 mt-2 bg-slate-200 dark:bg-slate-700" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : analyticsData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <KPICard
              title="Total Bookings"
              value={analyticsData.kpi.totalBookings}
              trend={analyticsData.kpi.bookingsTrend}
              icon={CalendarCheck}
              colorClass="bg-blue-500"
            />
            <KPICard
              title="New Providers (Period)"
              value={analyticsData.kpi.newProvidersMonth}
              trend={analyticsData.kpi.providersTrend}
              icon={Users}
              colorClass="bg-purple-500"
            />
            <KPICard
              title="Active Patients"
              value={analyticsData.kpi.activePatients}
              trend={analyticsData.kpi.patientsTrend}
              icon={Activity}
              colorClass="bg-orange-500"
            />
          </div>
        ) : null}

        {/* Main Charts Section Row 1 */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <Skeleton className="h-6 w-48 bg-slate-200 dark:bg-slate-700" />
                <Skeleton className="h-4 w-64 mt-2 bg-slate-200 dark:bg-slate-700" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full bg-slate-200 dark:bg-slate-700" />
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <Skeleton className="h-6 w-48 bg-slate-200 dark:bg-slate-700" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full bg-slate-200 dark:bg-slate-700" />
              </CardContent>
            </Card>
          </div>
        ) : analyticsData ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ServiceTrendsChart data={analyticsData.serviceTrends} />
            </div>
            <div className="lg:col-span-1">
              <TopProvidersChart data={analyticsData.topProviders} />
            </div>
          </div>
        ) : null}

        {/* Main Charts Section Row 2 */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <Skeleton className="h-6 w-48 bg-slate-200 dark:bg-slate-700" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full bg-slate-200 dark:bg-slate-700" />
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <Skeleton className="h-6 w-48 bg-slate-200 dark:bg-slate-700" />
                <Skeleton className="h-4 w-64 mt-2 bg-slate-200 dark:bg-slate-700" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full bg-slate-200 dark:bg-slate-700" />
              </CardContent>
            </Card>
          </div>
        ) : analyticsData ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopServicesChart data={analyticsData.topServices} />
            <PeakTimesChart
              peakDays={analyticsData.peakDays}
              peakHours={analyticsData.peakHours}
            />
          </div>
        ) : null}

        {/* Data Tables Section */}
        {isLoading ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="xl:col-span-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <Skeleton className="h-6 w-48 bg-slate-200 dark:bg-slate-700" />
                <Skeleton className="h-4 w-64 mt-2 bg-slate-200 dark:bg-slate-700" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full bg-slate-200 dark:bg-slate-700" />
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <Skeleton className="h-6 w-48 bg-slate-200 dark:bg-slate-700" />
                <Skeleton className="h-4 w-64 mt-2 bg-slate-200 dark:bg-slate-700" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full bg-slate-200 dark:bg-slate-700" />
              </CardContent>
            </Card>
          </div>
        ) : analyticsData ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <ProviderPerformanceTable
                data={analyticsData.providerPerformance}
              />
            </div>
            <div className="xl:col-span-1">
              <ActiveUsersList data={analyticsData.activeUsers} />
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/provider-components/appointment-components/date-range-picker";
import { AppointmentTrendsChart } from "@/components/provider-components/analytics-component/appointment-trends-chart";
import { PeakHoursChart } from "@/components/provider-components/analytics-component/peak-hours-chart";
import { PopularServicesChart } from "@/components/provider-components/analytics-component/popular-services-chart";
import { CancellationReasonsChart } from "@/components/provider-components/analytics-component/cancellation-reasons-chart";
import { StatusDistributionChart } from "@/components/provider-components/analytics-component/status-distribution-chart";
import { useProviderAnalytics } from "@/hooks/use-get-provider-analytics-hook";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar, Star, Activity, XCircle, Users } from "lucide-react";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30days");
  
  const getInitialDates = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return { start: thirtyDaysAgo, end: today };
  };
  
  const [startTimestamp, setStartTimestamp] = useState(getInitialDates().start.getTime());
  const [endTimestamp, setEndTimestamp] = useState(getInitialDates().end.getTime());

  const startDate = new Date(startTimestamp);
  const endDate = new Date(endTimestamp);

  // Fetch analytics data
  const { data: analyticsData, isLoading } = useProviderAnalytics({
    startDate,
    endDate,
  });

  const handleDateRangeClick = (range: string) => {
    setDateRange(range);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let newStartDate: Date;
    const newEndDate: Date = new Date(today);

    if (range === "today") {
      newStartDate = new Date(today);
    } else if (range === "7days") {
      newStartDate = new Date(today);
      newStartDate.setDate(newStartDate.getDate() - 7);
    } else if (range === "30days") {
      newStartDate = new Date(today);
      newStartDate.setDate(newStartDate.getDate() - 30);
    } else if (range === "90days") {
      newStartDate = new Date(today);
      newStartDate.setDate(newStartDate.getDate() - 90);
    } else {
      return;
    }

    setStartTimestamp(newStartDate.getTime());
    setEndTimestamp(newEndDate.getTime());
  };

  const handleCustomDateRange = (from: Date, to: Date) => {
    setDateRange("custom");
    const newStartDate = new Date(from);
    newStartDate.setHours(0, 0, 0, 0);
    const newEndDate = new Date(to);
    newEndDate.setHours(0, 0, 0, 0);
    setStartTimestamp(newStartDate.getTime());
    setEndTimestamp(newEndDate.getTime());
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Provider Analytics
            </h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-slate-400 mt-1">
              Performance metrics, financials, and patient insights.
            </p>
          </div>
        </div>

        {/* Date Range Filters */}
        <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
          <Button
            className={`text-xs sm:text-sm ${
              dateRange === "today"
                ? "bg-gray-900 hover:bg-gray-800 text-white dark:bg-cyan-600 dark:hover:bg-cyan-700"
                : "border-gray-300 dark:border-white/10 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5"
            }`}
            variant={dateRange === "today" ? "default" : "outline"}
            onClick={() => handleDateRangeClick("today")}
            size="sm"
          >
            Today
          </Button>
          <Button
            className={`text-xs sm:text-sm ${
              dateRange === "7days"
                ? "bg-gray-900 hover:bg-gray-800 text-white dark:bg-cyan-600 dark:hover:bg-cyan-700"
                : "border-gray-300 dark:border-white/10 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5"
            }`}
            variant={dateRange === "7days" ? "default" : "outline"}
            onClick={() => handleDateRangeClick("7days")}
            size="sm"
          >
            7 Days
          </Button>
          <Button
            className={`text-xs sm:text-sm ${
              dateRange === "30days"
                ? "bg-gray-900 hover:bg-gray-800 text-white dark:bg-cyan-600 dark:hover:bg-cyan-700"
                : "border-gray-300 dark:border-white/10 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5"
            }`}
            variant={dateRange === "30days" ? "default" : "outline"}
            onClick={() => handleDateRangeClick("30days")}
            size="sm"
          >
            30 Days
          </Button>
          <Button
            className={`text-xs sm:text-sm ${
              dateRange === "90days"
                ? "bg-gray-900 hover:bg-gray-800 text-white dark:bg-cyan-600 dark:hover:bg-cyan-700"
                : "border-gray-300 dark:border-white/10 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5"
            }`}
            variant={dateRange === "90days" ? "default" : "outline"}
            onClick={() => handleDateRangeClick("90days")}
            size="sm"
          >
            90 Days
          </Button>
          <DateRangePicker
            onDateRangeChange={handleCustomDateRange}
            startDate={startDate}
            endDate={endDate}
          />
        </div>

        {/* KPI Cards */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
                <CardHeader className="p-3 sm:p-4 pb-2">
                  <Skeleton className="h-4 w-20 sm:w-32 bg-slate-200 dark:bg-white/10" />
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0">
                  <Skeleton className="h-6 sm:h-8 w-16 sm:w-20 bg-slate-200 dark:bg-white/10" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : analyticsData ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <Card className="p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400 truncate">Appointments</p>
                  <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {analyticsData.totalBookings}
                  </h3>
                </div>
                <div className="p-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-lg shrink-0 ml-2">
                  <Calendar className="size-4" />
                </div>
              </div>
            </Card>

            <Card className="p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400 truncate">Completion</p>
                  <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {analyticsData.completionRate}%
                  </h3>
                </div>
                <div className="p-1.5 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 rounded-lg shrink-0 ml-2">
                  <Activity className="size-4" />
                </div>
              </div>
            </Card>

            <Card className="p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400 truncate">Cancellation</p>
                  <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {analyticsData.cancellationRate}%
                  </h3>
                </div>
                <div className="p-1.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg shrink-0 ml-2">
                  <XCircle className="size-4" />
                </div>
              </div>
            </Card>

            <Card className="p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400 truncate">Avg Rating</p>
                  <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {analyticsData.avgRating || "N/A"}
                  </h3>
                </div>
                <div className="p-1.5 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 rounded-lg shrink-0 ml-2">
                  <Star className="size-4" />
                </div>
              </div>
            </Card>

            <Card className="p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400 truncate">Total Patients</p>
                  <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {analyticsData.totalPatients || 0}
                  </h3>
                </div>
                <div className="p-1.5 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-lg shrink-0 ml-2">
                  <Users className="size-4" />
                </div>
              </div>
            </Card>
          </div>
        ) : null}

        {/* Appointment Trends Chart */}
        {isLoading ? (
          <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
            <CardHeader>
              <Skeleton className="h-6 w-48 bg-slate-200 dark:bg-white/10" />
              <Skeleton className="h-4 w-64 mt-2 bg-slate-200 dark:bg-white/10" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full bg-slate-200 dark:bg-white/10" />
            </CardContent>
          </Card>
        ) : analyticsData ? (
          <AppointmentTrendsChart data={analyticsData.appointmentTrends || []} />
        ) : null}

        {/* Top Services & Peak Hours - 3 Column Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
              <CardHeader>
                <Skeleton className="h-6 w-48 bg-slate-200 dark:bg-white/10" />
                <Skeleton className="h-4 w-64 mt-2 bg-slate-200 dark:bg-white/10" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[250px] w-full bg-slate-200 dark:bg-white/10" />
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
              <CardHeader>
                <Skeleton className="h-6 w-48 bg-slate-200 dark:bg-white/10" />
                <Skeleton className="h-4 w-64 mt-2 bg-slate-200 dark:bg-white/10" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[250px] w-full bg-slate-200 dark:bg-white/10" />
              </CardContent>
            </Card>
          </div>
        ) : analyticsData ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PopularServicesChart data={analyticsData.popularServices || []} />
            </div>
            <PeakHoursChart data={analyticsData.peakHours || []} />
          </div>
        ) : null}

        {/* Cancellation Reasons & Status Distribution - 3 Column Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
              <CardHeader>
                <Skeleton className="h-6 w-48 bg-slate-200 dark:bg-white/10" />
                <Skeleton className="h-4 w-64 mt-2 bg-slate-200 dark:bg-white/10" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[250px] w-full bg-slate-200 dark:bg-white/10" />
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
              <CardHeader>
                <Skeleton className="h-6 w-48 bg-slate-200 dark:bg-white/10" />
                <Skeleton className="h-4 w-64 mt-2 bg-slate-200 dark:bg-white/10" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[250px] w-full bg-slate-200 dark:bg-white/10" />
              </CardContent>
            </Card>
          </div>
        ) : analyticsData ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CancellationReasonsChart data={analyticsData.cancellationReasons || []} />
            </div>
            <StatusDistributionChart data={analyticsData.statusData || []} />
          </div>
        ) : null}
      </div>
    </main>
  );
}

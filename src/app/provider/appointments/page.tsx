"use client";

import { useState, useCallback, useMemo } from "react";
import { AppointmentStatusSection } from "@/components/provider-components/appointment-components/appointment-status-section";
import { BulkActionsBar } from "@/components/provider-components/appointment-components/bulk-actions-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DateRangePicker } from "@/components/provider-components/appointment-components/date-range-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  useProviderAppointments,
  useAppointmentStatistics,
  useUpdateAppointmentStatus,
  useCancelAppointment,
} from "@/hooks/use-get-provider-appointment";
import { AppointmentStatus } from "@/lib/generated/prisma";
import { CalendarDays, Clock, CheckCircle2, XCircle, LayoutList, CalendarCheck, AlertCircle } from "lucide-react";

export default function AppointmentsPage() {
  const [dateRange, setDateRange] = useState("today");
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState(false);

  // Use timestamps to avoid infinite re-renders
  const getTodayTimestamp = () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  };

  const [startTimestamp, setStartTimestamp] = useState(getTodayTimestamp());
  const [endTimestamp, setEndTimestamp] = useState(getTodayTimestamp());

  // Convert timestamps to dates for the queries
  const startDate = new Date(startTimestamp);
  const endDate = new Date(endTimestamp);

  // Fetch appointments and statistics
  const { data: appointments = [], isLoading: isLoadingAppointments } = useProviderAppointments({
    startDate,
    endDate,
  });

  const { data: stats, isLoading: isLoadingStats } = useAppointmentStatistics({
    startDate,
    endDate,
  });

  const updateStatusMutation = useUpdateAppointmentStatus();
  const cancelMutation = useCancelAppointment();

  const handleDateRangeClick = (range: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let newStartDate: Date;
    let newEndDate: Date;

    if (range === "today") {
      newStartDate = new Date();
      newStartDate.setHours(0, 0, 0, 0);
      newEndDate = new Date();
      newEndDate.setHours(0, 0, 0, 0);
    } else if (range === "yesterday") {
      newStartDate = new Date(today);
      newStartDate.setDate(newStartDate.getDate() - 1);
      newEndDate = new Date(today);
      newEndDate.setDate(newEndDate.getDate() - 1);
    } else if (range === "7days") {
      newStartDate = new Date(today);
      newStartDate.setDate(newStartDate.getDate() - 7);
      newEndDate = new Date(today);
    } else if (range === "30days") {
      newStartDate = new Date(today);
      newStartDate.setDate(newStartDate.getDate() - 30);
      newEndDate = new Date(today);
    } else {
      return;
    }

    setDateRange(range);
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

  const handleApprove = (id: string) => {
    setApprovingId(id);
    updateStatusMutation.mutate({
      appointmentId: id,
      status: "CONFIRMED",
    }, {
      onSettled: () => {
        setApprovingId(null);
      }
    });
  };

  const handleStatusChange = (id: string, status: AppointmentStatus, activityNotes?: string) => {
    if (status === "COMPLETED") {
      setCompletingId(id);
    }
    updateStatusMutation.mutate({
      appointmentId: id,
      status,
      activityNotes,
    }, {
      onSettled: () => {
        setCompletingId(null);
      }
    });
  };

  const handleCancel = (id: string, reason: string, notes?: string) => {
    setCancellingId(id);
    cancelMutation.mutate({
      appointmentId: id,
      reason,
      notes,
    }, {
      onSettled: () => {
        setCancellingId(null);
      }
    });
  };

  // Bulk selection handlers
  const handleSelectAppointment = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (appointments) {
      // Select only actionable appointments (pending, confirmed)
      const actionableIds = appointments
        .filter((apt) => apt.status === "PENDING" || apt.status === "CONFIRMED")
        .map((apt) => apt.id);
      setSelectedIds(actionableIds);
    }
  }, [appointments]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // Toggle bulk mode
  const handleToggleBulkMode = useCallback((enabled: boolean) => {
    setBulkMode(enabled);
    if (!enabled) {
      setSelectedIds([]);
    }
  }, []);

  // Calculate if all actionable appointments are selected
  const allActionableSelected = useMemo(() => {
    if (!appointments || appointments.length === 0) return false;
    const actionableIds = appointments
      .filter((apt) => apt.status === "PENDING" || apt.status === "CONFIRMED")
      .map((apt) => apt.id);
    return (
      actionableIds.length > 0 &&
      actionableIds.every((id) => selectedIds.includes(id))
    );
  }, [appointments, selectedIds]);

  const totalActionableCount = useMemo(() => {
    if (!appointments) return 0;
    return appointments.filter(
      (apt) => apt.status === "PENDING" || apt.status === "CONFIRMED"
    ).length;
  }, [appointments]);

  const isLoading = isLoadingAppointments || isLoadingStats;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0B0F19]">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
              Appointments
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
              Manage online bookings from customers
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Label
              htmlFor="bulk-mode"
              className="text-sm text-slate-600 dark:text-slate-400"
            >
              Bulk Actions
            </Label>
            <Switch
              id="bulk-mode"
              checked={bulkMode}
              onCheckedChange={handleToggleBulkMode}
            />
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {bulkMode && (
          <BulkActionsBar
            selectedIds={selectedIds}
            totalCount={totalActionableCount}
            onSelectAll={handleSelectAll}
            onClearSelection={handleClearSelection}
            allSelected={allActionableSelected}
            disabled={isLoading}
          />
        )}

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
              dateRange === "yesterday"
                ? "bg-gray-900 hover:bg-gray-800 text-white dark:bg-cyan-600 dark:hover:bg-cyan-700"
                : "border-gray-300 dark:border-white/10 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5"
            }`}
            variant={dateRange === "yesterday" ? "default" : "outline"}
            onClick={() => handleDateRangeClick("yesterday")}
            size="sm"
          >
            Yesterday
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
          <DateRangePicker
            onDateRangeChange={handleCustomDateRange}
            startDate={startDate}
            endDate={endDate}
          />
        </div>

        {/* Statistics Cards */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-white dark:bg-slate-800 border-gray-200 dark:border-white/10">
                <CardContent className="p-3 sm:p-4">
                  <Skeleton className="h-4 w-16 mb-2 bg-slate-200 dark:bg-white/10" />
                  <Skeleton className="h-6 w-10 bg-slate-200 dark:bg-white/10" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <Card className="p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400 truncate">Today</p>
                  <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats?.today || 0}
                  </h3>
                </div>
                <div className="p-1.5 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 rounded-lg shrink-0 ml-2">
                  <CalendarDays className="size-4" />
                </div>
              </div>
            </Card>

            <Card className="p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400 truncate">Pending</p>
                  <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats?.pending || 0}
                  </h3>
                </div>
                <div className="p-1.5 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 rounded-lg shrink-0 ml-2">
                  <Clock className="size-4" />
                </div>
              </div>
            </Card>

            <Card className="p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400 truncate">Confirmed</p>
                  <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats?.confirmed || 0}
                  </h3>
                </div>
                <div className="p-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-lg shrink-0 ml-2">
                  <CalendarCheck className="size-4" />
                </div>
              </div>
            </Card>

            <Card className="p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400 truncate">Completed</p>
                  <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats?.completed || 0}
                  </h3>
                </div>
                <div className="p-1.5 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 rounded-lg shrink-0 ml-2">
                  <CheckCircle2 className="size-4" />
                </div>
              </div>
            </Card>

            <Card className="p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400 truncate">Cancelled</p>
                  <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats?.cancelled || 0}
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
                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400 truncate">Total</p>
                  <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats?.total || 0}
                  </h3>
                </div>
                <div className="p-1.5 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-lg shrink-0 ml-2">
                  <LayoutList className="size-4" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Appointment Sections */}
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
                <CardHeader>
                  <Skeleton className="h-6 w-48 bg-slate-200 dark:bg-white/10" />
                  <Skeleton className="h-4 w-64 mt-2 bg-slate-200 dark:bg-white/10" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full bg-slate-200 dark:bg-white/10" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <AppointmentStatusSection
              status="PENDING"
              title="Pending Approval"
              description="Appointments awaiting confirmation"
              icon={AlertCircle}
              bgColor="bg-orange-50 dark:bg-orange-950/30"
              borderColor="border-orange-200 dark:border-orange-800"
              emptyMessage="No pending appointments"
              emptySubMessage="All appointments are confirmed or no new bookings"
              appointments={appointments}
              onApprove={handleApprove}
              onCancel={handleCancel}
              onStatusChange={handleStatusChange}
              approvingId={approvingId}
              completingId={completingId}
              cancellingId={cancellingId}
              selectedIds={selectedIds}
              onSelect={handleSelectAppointment}
              showCheckboxes={bulkMode}
            />

            <AppointmentStatusSection
              status="CONFIRMED"
              title="Confirmed"
              description="Scheduled appointments ready for service"
              icon={CheckCircle2}
              bgColor="bg-blue-50 dark:bg-blue-950/30"
              borderColor="border-blue-200 dark:border-blue-800"
              emptyMessage="No confirmed appointments"
              emptySubMessage="Confirm pending appointments or wait for new bookings"
              appointments={appointments}
              onApprove={handleApprove}
              onCancel={handleCancel}
              onStatusChange={handleStatusChange}
              approvingId={approvingId}
              completingId={completingId}
              cancellingId={cancellingId}
              selectedIds={selectedIds}
              onSelect={handleSelectAppointment}
              showCheckboxes={bulkMode}
            />

            {/* <AppointmentStatusSection
              status="COMPLETED"
              title="Completed"
              description="Finished appointments"
              icon={CheckCircleIcon}
              bgColor="bg-green-50 dark:bg-green-950/30"
              borderColor="border-green-200 dark:border-green-800"
              emptyMessage="No completed appointments"
              emptySubMessage="Appointments will appear here once completed"
              appointments={appointments}
              onApprove={handleApprove}
              onStatusChange={handleStatusChange}
              approvingId={approvingId}
            />

            <AppointmentStatusSection
              status="CANCELLED"
              title="Cancelled"
              description="Cancelled appointments"
              icon={XIcon}
              bgColor="bg-red-50 dark:bg-red-950/30"
              borderColor="border-red-200 dark:border-red-800"
              emptyMessage="No cancelled appointments"
              emptySubMessage="Appointments will appear here if cancelled"
              appointments={appointments}
              onApprove={handleApprove}
              onStatusChange={handleStatusChange}
              approvingId={approvingId}
            /> */}
          </div>
        )}
      </div>
    </main>
  );
}

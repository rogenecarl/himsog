"use client";

import { useState, useMemo } from "react";
import CalendarHeader from "@/components/provider-components/calendar-components/calendar-header";
import DayView from "@/components/provider-components/calendar-components/day-view";
import WeekView from "@/components/provider-components/calendar-components/week-view";
import MonthView from "@/components/provider-components/calendar-components/month-view";
import { useCalendarAppointments } from "@/hooks/use-provider-calendar";
import { useProviderProfile } from "@/hooks/use-provider-profile";
import { getWeekStart } from "@/components/provider-components/calendar-components/date-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

type ViewType = "day" | "week" | "month";

// Loading skeleton component
const CalendarSkeleton = ({ view }: { view: ViewType }) => {
  if (view === "month") {
    return (
      <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
        <div className="p-4">
          {/* Month view skeleton */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center py-2">
                <Skeleton className="h-4 w-12 mx-auto bg-slate-200 dark:bg-white/10" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="aspect-square border border-slate-200 dark:border-white/10 rounded-lg p-2">
                <Skeleton className="h-4 w-6 mb-2 bg-slate-200 dark:bg-white/10" />
                <Skeleton className="h-3 w-full mb-1 bg-slate-200 dark:bg-white/10" />
                <Skeleton className="h-3 w-3/4 bg-slate-200 dark:bg-white/10" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  } else if (view === "week") {
    return (
      <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
        <div className="p-4">
          {/* Week view skeleton */}
          <div className="grid grid-cols-8 gap-2">
            <div className="col-span-1">
              <Skeleton className="h-6 w-16 mb-2 bg-slate-200 dark:bg-white/10" />
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full mb-2 bg-slate-200 dark:bg-white/10" />
              ))}
            </div>
            {Array.from({ length: 7 }).map((_, dayIndex) => (
              <div key={dayIndex} className="col-span-1">
                <Skeleton className="h-6 w-full mb-2 bg-slate-200 dark:bg-white/10" />
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-16 mb-2">
                    {i % 3 === 0 && <Skeleton className="h-14 w-full bg-slate-200 dark:bg-white/10" />}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  } else {
    return (
      <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
        <div className="p-4">
          {/* Day view skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 mb-4 bg-slate-200 dark:bg-white/10" />
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-16 w-20 bg-slate-200 dark:bg-white/10" />
                <div className="flex-1">
                  {i % 2 === 0 && (
                    <Skeleton className="h-14 w-full bg-slate-200 dark:bg-white/10" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>("month");

  // Fetch provider profile for operating hours
  const { data: provider } = useProviderProfile();

  // Extract operating hours from provider profile
  const operatingHours = useMemo(() => {
    if (!provider?.operatingHours) return [];
    return provider.operatingHours.map(h => ({
      dayOfWeek: h.dayOfWeek,
      startTime: h.startTime,
      endTime: h.endTime,
      isClosed: h.isClosed,
    }));
  }, [provider?.operatingHours]);

  // Calculate date range based on view
  const dateRange = useMemo(() => {
    if (view === "day") {
      const start = new Date(currentDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(currentDate);
      end.setHours(23, 59, 59, 999);
      return { startDate: start, endDate: end };
    } else if (view === "week") {
      const start = getWeekStart(currentDate);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { startDate: start, endDate: end };
    } else {
      // Month view
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      return { startDate: start, endDate: end };
    }
  }, [currentDate, view]);

  // Fetch appointments for the current view
  const { data: appointments = [], isLoading } = useCalendarAppointments(dateRange);

  const handlePreviousDate = () => {
    const newDate = new Date(currentDate);
    if (view === "day") {
      newDate.setDate(newDate.getDate() - 1);
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNextDate = () => {
    const newDate = new Date(currentDate);
    if (view === "day") {
      newDate.setDate(newDate.getDate() + 1);
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">Calendar</h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
          Manage your appointments and schedule
        </p>
      </div>

      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onPrevious={handlePreviousDate}
        onNext={handleNextDate}
        onToday={handleToday}
      />

      {isLoading ? (
        <CalendarSkeleton view={view} />
      ) : (
        <div>
          {view === "month" && (
            <MonthView 
              currentDate={currentDate} 
              appointments={appointments}
              isLoading={isLoading}
            />
          )}
          {view === "week" && (
            <WeekView 
              currentDate={currentDate} 
              appointments={appointments}
              isLoading={isLoading}
            />
          )}
          {view === "day" && (
            <DayView
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              appointments={appointments}
              isLoading={isLoading}
              operatingHours={operatingHours}
            />
          )}
        </div>
      )}
    </div>
  );
}

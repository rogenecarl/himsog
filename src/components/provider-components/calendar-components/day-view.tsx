"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getWeekStart, getDaysInMonth, getFirstDayOfMonth } from "./date-utils";
import { AppointmentStatus } from "@/lib/generated/prisma";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string | null;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  totalPrice: number;
  services?: Array<{
    service: {
      name: string;
      description: string | null;
    };
  }>;
  user?: {
    id: string;
    image?: string | null;
  };
}

interface DayViewProps {
  currentDate: Date;
  onDateChange?: (date: Date) => void;
  appointments?: Appointment[];
  isLoading?: boolean;
  operatingHours?: Array<{
    dayOfWeek: number;
    startTime: string | null;
    endTime: string | null;
    isClosed: boolean;
  }>;
}

const statusConfig = {
  PENDING: {
    bg: "bg-orange-100 dark:bg-orange-950/50",
    text: "text-orange-700 dark:text-orange-300",
    border: "border-orange-200 dark:border-orange-800",
    badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  },
  CONFIRMED: {
    bg: "bg-blue-100 dark:bg-blue-950/50",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  COMPLETED: {
    bg: "bg-green-100 dark:bg-green-950/50",
    text: "text-green-700 dark:text-green-300",
    border: "border-green-200 dark:border-green-800",
    badge: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  CANCELLED: {
    bg: "bg-gray-100 dark:bg-gray-800/50",
    text: "text-gray-600 dark:text-gray-400",
    border: "border-gray-200 dark:border-gray-700",
    badge: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  },
  NO_SHOW: {
    bg: "bg-red-100 dark:bg-red-950/50",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
    badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
};

export default function DayView({
  currentDate,
  onDateChange,
  appointments = [],
  operatingHours = [],
}: DayViewProps) {
  const router = useRouter();
  const [miniCalendarDate, setMiniCalendarDate] = useState(new Date(currentDate));

  // Navigate to appointments page when clicking an appointment
  const handleAppointmentClick = (appointmentId: string) => {
    router.push(`/provider/appointments?highlight=${appointmentId}`);
  };

  const dayName = currentDate.toLocaleString("en-US", { weekday: "long" });
  const date = currentDate.getDate();
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Get week for sidebar
  const weekStart = getWeekStart(currentDate);
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    weekDays.push(d);
  }

  const today = new Date();
  const isToday = currentDate.toDateString() === today.toDateString();

  // Get operating hours for current day (0 = Sunday, 6 = Saturday)
  const currentDayOfWeek = currentDate.getDay();
  const todayOperatingHours = operatingHours.find(h => h.dayOfWeek === currentDayOfWeek);

  // Parse operating hours to determine which slots are available
  const getOperatingHourRange = () => {
    if (!todayOperatingHours || todayOperatingHours.isClosed) {
      return { startHour: -1, endHour: -1, isClosed: true };
    }
    const startHour = todayOperatingHours.startTime
      ? parseInt(todayOperatingHours.startTime.split(':')[0])
      : 9;
    const endHour = todayOperatingHours.endTime
      ? parseInt(todayOperatingHours.endTime.split(':')[0])
      : 18;
    return { startHour, endHour, isClosed: false };
  };

  const operatingRange = getOperatingHourRange();

  const handleDateClick = (day: number, monthOffset: number = 0) => {
    const newDate = new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth() + monthOffset, day);
    onDateChange?.(newDate);
  };

  // Mini calendar navigation
  const handlePrevMonth = () => {
    setMiniCalendarDate(new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setMiniCalendarDate(new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth() + 1, 1));
  };

  // Generate mini calendar days
  const generateMiniCalendarDays = () => {
    const firstDay = getFirstDayOfMonth(miniCalendarDate);
    const daysInMonth = getDaysInMonth(miniCalendarDate);
    const daysInPrevMonth = getDaysInMonth(new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth() - 1, 1));

    const days: Array<{ day: number; isCurrentMonth: boolean; monthOffset: number }> = [];

    // Previous month days (adjust for Sunday start)
    const prevMonthDays = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, isCurrentMonth: false, monthOffset: -1 });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true, monthOffset: 0 });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false, monthOffset: 1 });
    }

    return days;
  };

  const miniCalendarDays = generateMiniCalendarDays();

  return (
    <div className="grid grid-cols-[1fr_320px] gap-6">
      {/* Main day view */}
      <div className="bg-white dark:bg-[#1E293B] rounded-lg border border-slate-200 dark:border-white/10 overflow-hidden">
        {/* Day header */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E293B]">
          <div className="text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            {dayName}
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{date}</div>
        </div>

        {/* Operating hours indicator */}
        {operatingHours.length > 0 && (
          <div className="px-4 py-2 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 text-sm">
              {operatingRange.isClosed ? (
                <span className="text-red-600 dark:text-red-400 font-medium">Closed today</span>
              ) : (
                <>
                  <span className="text-slate-600 dark:text-slate-400">Operating hours:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {todayOperatingHours?.startTime || "09:00"} - {todayOperatingHours?.endTime || "18:00"}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Time slots */}
        <div
          className="overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 340px)" }}
        >
          {hours.map((hour) => {
            const hourAppointments = appointments.filter((apt) => {
              const aptHour = new Date(apt.startTime).getHours();
              return aptHour === hour;
            });

            // Check if this hour is outside operating hours
            const isOutsideOperatingHours = operatingHours.length > 0 && (
              operatingRange.isClosed ||
              hour < operatingRange.startHour ||
              hour >= operatingRange.endHour
            );

            return (
              <div
                key={hour}
                className={`grid grid-cols-[100px_1fr] border-b border-slate-200 dark:border-white/10 min-h-20 transition-colors ${
                  isOutsideOperatingHours
                    ? "bg-slate-100 dark:bg-slate-900/50 opacity-60"
                    : "hover:bg-slate-50 dark:hover:bg-white/5"
                }`}
              >
                <div className={`p-4 text-xs text-right border-r border-slate-200 dark:border-white/10 ${
                  isOutsideOperatingHours
                    ? "text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-900"
                    : "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800"
                }`}>
                  {hour === 0
                    ? "12 AM"
                    : hour < 12
                    ? `${hour} AM`
                    : hour === 12
                    ? "12 PM"
                    : `${hour - 12} PM`}
                </div>
                <div className={`p-2 ${!isOutsideOperatingHours ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5" : ""}`}>
                  {hourAppointments.map((apt) => {
                    const config = statusConfig[apt.status as keyof typeof statusConfig] || statusConfig.PENDING;

                    return (
                      <div
                        key={apt.id}
                        onClick={() => handleAppointmentClick(apt.id)}
                        className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all ${config.bg} ${config.text} ${config.border} mb-2`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold">{apt.patientName}</p>
                            <p className="text-xs mt-1">
                              {apt.services?.map(s => s.service.name).join(", ") || "Service"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold">
                              {new Date(apt.startTime).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )}{" "}
                              -{" "}
                              {new Date(apt.endTime).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )}
                            </p>
                            <p className="text-xs mt-1 font-medium">
                              ₱{apt.totalPrice.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Mini calendar - Dynamic */}
        <div className="bg-white dark:bg-[#1E293B] rounded-lg border border-slate-200 dark:border-white/10 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              {miniCalendarDate.toLocaleString("en-US", { month: "long", year: "numeric" })}
            </h3>
            <div className="flex gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div key={day} className="text-slate-600 dark:text-slate-400 font-semibold">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {miniCalendarDays.map((item, idx) => {
              const itemDate = new Date(
                miniCalendarDate.getFullYear(),
                miniCalendarDate.getMonth() + item.monthOffset,
                item.day
              );
              const isSelected = itemDate.toDateString() === currentDate.toDateString();
              const isTodayDate = itemDate.toDateString() === today.toDateString();

              return (
                <button
                  key={idx}
                  onClick={() => handleDateClick(item.day, item.monthOffset)}
                  className={`p-1.5 text-xs rounded font-medium transition-colors ${
                    isSelected && isTodayDate
                      ? "bg-cyan-600 dark:bg-cyan-500 text-white"
                      : isSelected
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : isTodayDate
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                      : item.isCurrentMonth
                      ? "text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                      : "text-slate-400 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  {item.day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Daily Summary */}
        <div className="bg-white dark:bg-[#1E293B] rounded-lg border border-slate-200 dark:border-white/10 p-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">
            {isToday ? "Today's" : dayName + "'s"} Appointments ({appointments.length})
          </h3>
          {appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-full border-2 border-slate-200 dark:border-white/10 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-slate-400 dark:text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No appointments scheduled
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {appointments.map((apt) => {
                const config = statusConfig[apt.status as keyof typeof statusConfig] || statusConfig.PENDING;

                return (
                  <div
                    key={apt.id}
                    onClick={() => handleAppointmentClick(apt.id)}
                    className={`p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-all ${config.bg} ${config.border}`}
                  >
                    <div className="flex items-center justify-between">
                      <p className={`font-semibold text-sm ${config.text}`}>{apt.patientName}</p>
                      <Badge variant="secondary" className={`text-xs ${config.badge}`}>
                        {apt.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {new Date(apt.startTime).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })} - {new Date(apt.endTime).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                    <p className="text-xs mt-1 text-slate-700 dark:text-slate-300">
                      {apt.services?.map(s => s.service.name).join(", ") || "Service"}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Daily revenue summary */}
          {appointments.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Expected Revenue</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  ₱{appointments
                    .filter(a => a.status !== "CANCELLED")
                    .reduce((sum, a) => sum + a.totalPrice, 0)
                    .toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

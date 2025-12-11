"use client";

import { getDaysInMonth, getFirstDayOfMonth } from "./date-utils";
import { AppointmentStatus } from "@/lib/generated/prisma";

interface Appointment {
  id: string;
  patientName: string;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  services?: Array<{
    service: {
      name: string;
    };
  }>;
}

interface MonthViewProps {
  currentDate: Date;
  appointments?: Appointment[];
  isLoading?: boolean;
}

export default function MonthView({ currentDate, appointments = [] }: MonthViewProps) {
  const monthStart = getFirstDayOfMonth(currentDate);
  const daysInMonth = getDaysInMonth(currentDate);
  const daysInPrevMonth = getDaysInMonth(
    new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
  );

  const days = [];

  // Previous month days
  for (let i = monthStart - 1; i >= 0; i--) {
    days.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      date: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        daysInPrevMonth - i
      ),
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    const isToday = date.toDateString() === new Date().toDateString();
    days.push({
      day: i,
      isCurrentMonth: true,
      isToday,
      date,
    });
  }

  // Next month days
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i),
    });
  }

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-lg border border-slate-200 dark:border-white/10">
      {/* Day names header */}
      <div className="grid grid-cols-7 gap-0 border-b border-slate-200 dark:border-white/10">
        {dayNames.map((name) => (
          <div
            key={name}
            className="p-4 text-center font-semibold text-slate-600 dark:text-slate-400 text-sm"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0">
        {days.map((item, idx) => {
          const dayAppointments = appointments.filter((apt) => {
            const aptDate = new Date(apt.startTime);
            return aptDate.toDateString() === item.date.toDateString();
          });

          return (
            <div
              key={idx}
              className={`min-h-[120px] p-2 border-r border-b border-slate-200 dark:border-white/10 flex flex-col ${
                item.isCurrentMonth ? "bg-white dark:bg-[#1E293B]" : "bg-slate-50 dark:bg-slate-800"
              } ${item.isToday ? "bg-blue-50 dark:bg-blue-950/30" : ""}`}
            >
              <span
                className={`font-semibold text-sm mb-1 ${
                  item.isCurrentMonth
                    ? item.isToday
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-900 dark:text-white"
                    : "text-slate-400 dark:text-slate-600"
                }`}
              >
                {item.day}
              </span>
              
              {/* Appointments */}
              <div className="space-y-1 overflow-y-auto flex-1">
                {dayAppointments.slice(0, 3).map((apt) => {
                  const time = new Date(apt.startTime).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  });
                  const statusColor = 
                    apt.status === "PENDING" ? "bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800" :
                    apt.status === "CONFIRMED" ? "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800" :
                    "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";

                  return (
                    <div
                      key={apt.id}
                      className={`text-xs p-1.5 rounded border ${statusColor} truncate cursor-pointer hover:shadow-sm transition-shadow`}
                      title={`${apt.patientName} - ${apt.services?.[0]?.service?.name || "Service"}`}
                    >
                      <div className="font-semibold truncate">{time}</div>
                      <div className="truncate">{apt.patientName}</div>
                    </div>
                  );
                })}
                {dayAppointments.length > 3 && (
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    +{dayAppointments.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

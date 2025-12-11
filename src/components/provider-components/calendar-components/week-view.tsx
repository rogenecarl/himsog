"use client";

import { getWeekStart } from "./date-utils";
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

interface WeekViewProps {
  currentDate: Date;
  appointments?: Appointment[];
  isLoading?: boolean;
}

export default function WeekView({ currentDate, appointments = [] }: WeekViewProps) {
  const weekStart = getWeekStart(currentDate);
  
  // Generate week days
  const weekDays: Date[] = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    return date;
  });

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-lg border border-slate-200 dark:border-white/10 overflow-hidden">
      {/* Week header */}
      <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-0 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E293B] sticky top-0 z-10">
        <div className="p-4"></div>
        {weekDays.map((date, idx) => (
          <div
            key={idx}
            className="p-4 text-center border-r border-slate-200 dark:border-white/10 last:border-r-0"
          >
            <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
              {dayNames[idx]}
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {date.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Time slots */}
      <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-0 overflow-x-auto relative">
        {hours.map((hour) => (
          <div
            key={hour}
            className="grid grid-cols-subgrid col-span-8 border-b border-slate-200 dark:border-white/10 min-h-20"
          >
            <div className="p-4 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800">
              {hour === 0
                ? "12 AM"
                : hour < 12
                ? `${hour} AM`
                : hour === 12
                ? "12 PM"
                : `${hour - 12} PM`}
            </div>
            {weekDays.map((day, dayIdx) => {
              const hourAppointments = appointments.filter((apt) => {
                const aptDate = new Date(apt.startTime);
                const aptHour = aptDate.getHours();
                return (
                  aptDate.toDateString() === day.toDateString() &&
                  aptHour === hour
                );
              });

              return (
                <div
                  key={dayIdx}
                  className="p-1 border-r border-slate-200 dark:border-white/10 last:border-r-0 bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors relative"
                >
                  {hourAppointments.map((apt) => {
                    const statusColor = 
                      apt.status === "PENDING" ? "bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800" :
                      apt.status === "CONFIRMED" ? "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800" :
                      "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";

                    return (
                      <div
                        key={apt.id}
                        className={`text-xs p-1.5 rounded border ${statusColor} mb-1 truncate`}
                        title={`${apt.patientName} - ${apt.services?.[0]?.service?.name || "Service"}`}
                      >
                        <div className="font-semibold truncate">{apt.patientName}</div>
                        <div className="truncate text-[10px]">
                          {new Date(apt.startTime).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

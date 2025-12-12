"use client"

import { useRouter } from "next/navigation"

interface Appointment {
  id: string;
  status: keyof typeof statusColors;
  startTime: Date;
  provider: {
    healthcareName: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface CalendarDayCellProps {
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  appointments: Appointment[]
}

const statusColors = {
  PENDING: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200" },
  CONFIRMED: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
  CANCELLED: { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" },
  COMPLETED: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
  NO_SHOW: { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" },
}

export default function CalendarDayCell({ day, isCurrentMonth, isToday, appointments }: CalendarDayCellProps) {
  const router = useRouter()

  const handleAppointmentClick = (appointmentId: string) => {
    router.push(`/appointments?highlight=${appointmentId}`)
  }

  const formatTime = (dateStr: Date) => {
    const date = new Date(dateStr)
    // Use local time components to avoid timezone conversion issues
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? "PM" : "AM"
    const displayHours = hours % 12 || 12
    const displayMinutes = minutes.toString().padStart(2, "0")
    return `${displayHours}:${displayMinutes} ${ampm}`
  }

  return (
    <div
      className={`min-h-24 border-r dark:border-white/10 border-b dark:border-white/10 p-2 flex flex-col overflow-hidden transition-colors ${
        !isCurrentMonth 
          ? "bg-gray-50 dark:bg-slate-900" 
          : isToday 
            ? "bg-cyan-50 dark:bg-cyan-900/20" 
            : "bg-white dark:bg-[#1E293B] hover:bg-gray-50 dark:hover:bg-slate-800"
      }`}
    >
      {/* Day Number */}
      <div className="mb-2">
        {isToday ? (
          <div className="w-6 h-6 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold">
            {day}
          </div>
        ) : (
          <div className={`text-xs font-semibold ${!isCurrentMonth ? "text-gray-400 dark:text-slate-600" : "text-gray-900 dark:text-white"}`}>
            {day}
          </div>
        )}
      </div>

      {/* Appointments */}
      <div className="space-y-1 flex-1 overflow-hidden">
        {appointments.slice(0, 2).map((apt) => {
          const status = apt.status as keyof typeof statusColors
          const colors = statusColors[status] || statusColors.PENDING
          const providerName = apt?.provider?.healthcareName || "Appointment"
          const shortName = providerName.length > 15 ? providerName.substring(0, 15) + "..." : providerName

          return (
            <div
              key={apt.id}
              onClick={() => handleAppointmentClick(apt.id)}
              className={`text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity border ${colors.bg} ${colors.text} ${colors.border}`}
              title={`${providerName} - ${formatTime(apt.startTime)}`}
            >
              <div className="font-medium truncate">{shortName}</div>
              <div className="text-[10px] opacity-75">{formatTime(apt.startTime)}</div>
            </div>
          )
        })}
        {appointments.length > 2 && (
          <div
            onClick={() => router.push("/appointments")}
            className="text-xs text-gray-600 dark:text-slate-400 font-medium px-2 cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
          >
            +{appointments.length - 2} more
          </div>
        )}
      </div>
    </div>
  )
}

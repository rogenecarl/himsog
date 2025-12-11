"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import CalendarDayCell from "./calendar-day-cell"

interface Appointment {
  id: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  startTime: Date;
  provider: {
    healthcareName: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface CalendarMonthProps {
  currentDate: Date
  onPrevMonth: () => void
  onNextMonth: () => void
  onToday: () => void
  appointments: Appointment[]
}

export default function CalendarMonth({ currentDate, onPrevMonth, onNextMonth, onToday, appointments }: CalendarMonthProps) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const days = []

  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ date: daysInPrevMonth - i, isCurrentMonth: false })
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ date: i, isCurrentMonth: true })
  }

  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    days.push({ date: i, isCurrentMonth: false })
  }

  const monthName = new Date(year, month).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <Card className="dark:bg-[#1E293B] dark:border-white/10">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Calendar</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={onPrevMonth} className="h-8 w-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-semibold text-gray-900 dark:text-white min-w-[180px] text-center">{monthName}</span>
            <Button variant="outline" size="icon" onClick={onNextMonth} className="h-8 w-8">
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="secondary" size="sm" onClick={onToday}>
              Today
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="w-full px-5">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-0 bg-gray-50 dark:bg-slate-800 border dark:border-white/10">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="h-12 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-slate-300 border-r dark:border-white/10 last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-0 border dark:border-white/10">
              {days.map((day, index) => {
                const cellDate = new Date(year, month, day.date)

                if (!day.isCurrentMonth) {
                  cellDate.setMonth(month + (index < 7 ? -1 : 1))
                }

                // Filter appointments for this specific day
                const appointmentsForDay = appointments.filter((apt) => {
                  const aptDate = new Date(apt.startTime)
                  aptDate.setHours(0, 0, 0, 0)
                  cellDate.setHours(0, 0, 0, 0)
                  return aptDate.getTime() === cellDate.getTime()
                })

                const checkDate = new Date(year, month, day.date)
                checkDate.setHours(0, 0, 0, 0)
                const isToday = checkDate.getTime() === today.getTime() && day.isCurrentMonth

                return (
                  <CalendarDayCell
                    key={index}
                    day={day.date}
                    isCurrentMonth={day.isCurrentMonth}
                    isToday={isToday}
                    appointments={appointmentsForDay}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"
import { ChevronLeft, ChevronRight, CalendarIcon, LayoutGrid, List } from "lucide-react"

interface CalendarHeaderProps {
  currentDate: Date
  view: "day" | "week" | "month"
  onViewChange: (view: "day" | "week" | "month") => void
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
}

export default function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onPrevious,
  onNext,
}: CalendarHeaderProps) {
  const monthName = currentDate.toLocaleString("en-US", { month: "long" })
  const year = currentDate.getFullYear()
  const day = currentDate.getDate()
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div className="border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E293B] rounded-lg overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Date badge */}
          <div className="flex h-12 w-12 sm:h-16 sm:w-16 flex-col items-center justify-center rounded-lg bg-cyan-500 dark:bg-cyan-600 text-white font-bold shrink-0">
            <div className="text-[10px] sm:text-xs">{monthName.slice(0, 3).toUpperCase()}</div>
            <div className="text-lg sm:text-2xl">{day}</div>
          </div>

          {/* Title and date range */}
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">
              {monthName} {year}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <button onClick={onPrevious} className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded text-slate-600 dark:text-slate-300">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{formattedDate}</p>
              <button onClick={onNext} className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded text-slate-600 dark:text-slate-300">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* View toggle buttons */}
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => onViewChange("day")}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded ${
              view === "day" ? "bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <List className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-medium">Day</span>
          </button>
          <button
            onClick={() => onViewChange("week")}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded ${
              view === "week" ? "bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-medium">Week</span>
          </button>
          <button
            onClick={() => onViewChange("month")}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded ${
              view === "month" ? "bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-medium">Month</span>
          </button>
        </div>
      </div>

      {/* Status Legend */}
      <div className="px-4 sm:px-6 py-2 sm:py-3 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/30">
        <div className="flex flex-wrap items-center gap-2 sm:gap-6">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Status:</span>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-orange-500 dark:bg-orange-400"></div>
              <span className="text-xs sm:text-sm text-slate-900 dark:text-white">Pending</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-500 dark:bg-blue-400"></div>
              <span className="text-xs sm:text-sm text-slate-900 dark:text-white">Upcoming</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 dark:bg-green-400"></div>
              <span className="text-xs sm:text-sm text-slate-900 dark:text-white">Completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

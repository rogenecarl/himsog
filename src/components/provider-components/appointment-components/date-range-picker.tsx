"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import * as React from "react"
import type { DateRange } from "react-day-picker"

const CalendarIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
)

interface DateRangePickerProps {
  onDateRangeChange: (from: Date, to: Date) => void
  startDate: Date
  endDate: Date
}

export function DateRangePicker({ onDateRangeChange, startDate, endDate }: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: startDate,
    to: endDate,
  })

  const handleSelect = (newDate: DateRange | undefined) => {
    setDate(newDate)
    if (newDate?.from && newDate?.to) {
      onDateRangeChange(newDate.from, newDate.to)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("gap-2 bg-transparent dark:bg-transparent border-slate-300 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5", !date && "text-slate-500 dark:text-slate-400")}>
          <CalendarIcon />
          Custom Range
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10" align="start">
        <div className="p-4">
          <Calendar
            autoFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            className="dark:text-white"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

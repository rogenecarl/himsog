"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar, Clock, AlertCircle, Loader2 } from "lucide-react"
import { useProviderAvailableSlots, useProviderOperatingDays } from "@/hooks/use-date-time-slots"
import { useCreateUserAppointmentStore } from "@/store/create-user-appointment-store"
import { format, isSameDay } from "date-fns"
import { formatTime24to12 } from "@/lib/utils/time-format"

interface AppointmentStep2Props {
    providerId: string
}

export default function AppointmentStep2({
    providerId,
}: AppointmentStep2Props) {
    const { selectedDate: rawSelectedDate, selectedTime, setDateTime } = useCreateUserAppointmentStore();

    // Ensure selectedDate is always a proper Date object or null
    const selectedDate = rawSelectedDate
        ? (rawSelectedDate instanceof Date ? rawSelectedDate : new Date(rawSelectedDate))
        : null;

    const [currentMonth, setCurrentMonth] = useState(new Date())

    // Fetch provider's operating days
    const { data: operatingDays = [], isLoading: isLoadingOperatingDays } = useProviderOperatingDays(providerId)

    // Fetch available slots for selected date
    const {
        data: availableSlots,
        isLoading: isLoadingSlotsData,
        error: slotsError
    } = useProviderAvailableSlots(providerId, selectedDate)

    const isLoadingSlots = isLoadingSlotsData && selectedDate !== null

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    }

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    }

    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const days = []

    for (let i = 0; i < firstDay; i++) {
        days.push(null)
    }

    for (let i = 1; i <= daysInMonth; i++) {
        // Create date at noon to avoid timezone issues when passing to server
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i)
        date.setHours(12, 0, 0, 0)
        days.push(date)
    }

    const isDateDisabled = (date: Date) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const checkDate = new Date(date)
        checkDate.setHours(0, 0, 0, 0)

        // Disable today and past dates (users can only book from tomorrow onwards)
        if (checkDate <= today) return true

        // Disable if provider doesn't operate on this day
        const dayOfWeek = date.getDay()
        return !operatingDays.includes(dayOfWeek)
    }

    // Get available time slots from the fetched data
    const timeSlots = useMemo(() => {
        if (!availableSlots || !availableSlots.isOperating) {
            return []
        }
        return availableSlots.timeSlots
    }, [availableSlots])

    // Handle date change and reset time if date changes
    const handleDateChange = (date: Date) => {
        if (!isSameDay(date, selectedDate || new Date(0))) {
            setDateTime(date, "") // Reset time when date changes
        } else {
            setDateTime(date, selectedTime || "")
        }
    }

    // Handle time change
    const handleTimeChange = (time: string) => {
        if (selectedDate) {
            setDateTime(selectedDate, time)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Select Date & Time</h2>
                <p className="mt-1 text-slate-600 dark:text-slate-400">Choose your preferred appointment date and time</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Calendar Section */}
                <Card className="p-6 bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
                    <div className="flex items-center gap-2 pb-4">
                        <Calendar className="h-5 w-5 text-slate-900 dark:text-white" />
                        <h3 className="font-semibold text-slate-900 dark:text-white">Select Date</h3>
                    </div>

                    <div className="mb-4 flex items-center justify-between">
                        <h4 className="font-medium text-slate-900 dark:text-white">
                            {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
                        </h4>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="mb-4 grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-600 dark:text-slate-400">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                            <div key={day}>{day}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {days.map((date, index) => {
                            if (!date) {
                                return <div key={`empty-${index}`} className="h-10" />
                            }

                            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()
                            const isDisabled = isDateDisabled(date)

                            return (
                                <button
                                    key={date.toDateString()}
                                    disabled={isDisabled || isLoadingOperatingDays}
                                    onClick={() => handleDateChange(date)}
                                    className={`h-10 rounded-lg font-medium transition-all ${isSelected
                                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                                            : isDisabled || isLoadingOperatingDays
                                                ? "cursor-not-allowed text-slate-300 dark:text-slate-600"
                                                : "border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-900 dark:hover:border-white hover:text-slate-900 dark:hover:text-white"
                                        }`}
                                >
                                    {date.getDate()}
                                </button>
                            )
                        })}
                    </div>
                </Card>

                {/* Time Slots Section */}
                <Card className="p-6 bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
                    <div className="flex items-center gap-2 pb-4">
                        <Clock className="h-5 w-5 text-slate-900 dark:text-white" />
                        <h3 className="font-semibold text-slate-900 dark:text-white">Available Times</h3>
                    </div>

                    {selectedDate ? (
                        <>
                            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                                {selectedDate.toLocaleDateString("default", { weekday: "long", month: "long", day: "numeric" })}
                            </p>

                            {isLoadingSlots ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                                    <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">Loading available times...</span>
                                </div>
                            ) : slotsError ? (
                                <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                    <p className="text-sm text-red-700 dark:text-red-300">Failed to load available times. Please try again.</p>
                                </div>
                            ) : !availableSlots?.isOperating ? (
                                <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                        This provider is not operating on {format(selectedDate, "EEEE")}. Please select another date.
                                    </p>
                                </div>
                            ) : timeSlots.length === 0 ? (
                                <div className="flex items-center gap-2 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg">
                                    <AlertCircle className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                    <p className="text-sm text-slate-700 dark:text-slate-300">No available time slots for this date.</p>
                                </div>
                            ) : (
                                <>
                                    {availableSlots?.operatingHours && (
                                        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
                                            Operating hours: {formatTime24to12(availableSlots.operatingHours.startTime)} - {formatTime24to12(availableSlots.operatingHours.endTime)}
                                        </p>
                                    )}
                                    <div className="grid grid-cols-2 gap-2">
                                        {timeSlots.map((slot) => (
                                            <button
                                                key={slot.time}
                                                onClick={() => slot.available && handleTimeChange(slot.time)}
                                                disabled={!slot.available}
                                                className={`rounded-lg py-3 font-medium transition-all relative ${selectedTime === slot.time
                                                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                                                        : slot.available
                                                            ? "border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-900 dark:hover:border-white"
                                                            : "border border-slate-100 dark:border-white/5 text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed"
                                                    }`}
                                                title={!slot.available ? slot.reason : undefined}
                                            >
                                                {formatTime24to12(slot.time)}
                                                {!slot.available && (
                                                    <span className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-xs bg-slate-200 dark:bg-slate-700 px-1 rounded opacity-75">
                                                            {slot.reason === "Already booked" ? "Booked" :
                                                                slot.reason === "Break time" ? "Break" :
                                                                    slot.reason === "Past time" ? "Past" : "N/A"}
                                                        </span>
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    {availableSlots?.breakTimes && availableSlots.breakTimes.length > 0 && (
                                        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                            <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">Break Times:</p>
                                            {availableSlots.breakTimes.map((breakTime, index) => (
                                                <p key={index} className="text-xs text-blue-600 dark:text-blue-400">
                                                    {breakTime.name}: {formatTime24to12(breakTime.startTime)} - {formatTime24to12(breakTime.endTime)}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <Calendar className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                            <p className="text-sm text-slate-600 dark:text-slate-400">Please select a date first</p>
                        </div>
                    )}
                </Card>
            </div>

            {selectedDate && selectedTime && (
                <Card className="border-l-4 border-l-green-600 bg-green-50 dark:bg-green-900/20 p-4">
                    <div className="flex gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 dark:bg-white">
                            <Clock className="h-4 w-4 text-white dark:text-slate-900" />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900 dark:text-white">Appointment Scheduled</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                {selectedDate.toLocaleDateString("default", { weekday: "long", month: "long", day: "numeric" })} at{" "}
                                {formatTime24to12(selectedTime)}
                            </p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    )
}

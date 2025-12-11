import React, { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  getDay
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AppointmentBase {
  startTime: Date | string;
  status: string;
  [key: string]: unknown;
}

interface CalendarWidgetProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  appointments: AppointmentBase[];
}

// Status colors for indicators
const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-400',
  CONFIRMED: 'bg-emerald-500',
  COMPLETED: 'bg-blue-500',
  CANCELLED: 'bg-red-400',
  NO_SHOW: 'bg-gray-400',
};

const MobileCalendarWidget: React.FC<CalendarWidgetProps> = ({ selectedDate, onSelectDate, appointments }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Get appointments for a specific day with their statuses
  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter(appt => isSameDay(new Date(appt.startTime), day));
  };

  // Get unique statuses for a day (for showing multiple status dots)
  const getStatusesForDay = (day: Date): string[] => {
    const dayAppointments = getAppointmentsForDay(day);
    const statuses = [...new Set(dayAppointments.map(appt => appt.status))];
    return statuses;
  };

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Calculate empty filler days for the start of the month to align grid
  const startDayIndex = getDay(startOfMonth(currentMonth));
  const emptyDays = Array.from({ length: startDayIndex });

  return (
    <div className="px-5 py-4">
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-1">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-full text-slate-500">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-full text-slate-500">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Status Legend */}
        <div className="flex flex-wrap gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="text-[10px] text-slate-500">Pending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[10px] text-slate-500">Confirmed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-[10px] text-slate-500">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            <span className="text-[10px] text-slate-500">Cancelled</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day, index) => (
            <div key={index} className="text-center text-xs font-medium text-slate-400 py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {emptyDays.map((_, i) => <div key={`empty-${i}`} />)}

          {days.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);
            const dayStatuses = getStatusesForDay(day);
            const hasAppt = dayStatuses.length > 0;

            return (
              <button
                key={day.toISOString()}
                onClick={() => onSelectDate(day)}
                className={`
                  relative h-10 w-full rounded-xl flex items-center justify-center text-sm transition-all
                  ${isSelected
                    ? 'bg-slate-900 text-white font-semibold shadow-md shadow-slate-200'
                    : isTodayDate
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'}
                `}
              >
                {format(day, 'd')}
                {/* Status indicators */}
                {hasAppt && (
                  <div className={`absolute bottom-1 flex gap-0.5 ${isSelected ? 'opacity-80' : ''}`}>
                    {dayStatuses.slice(0, 3).map((status, idx) => (
                      <span
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : statusColors[status] || 'bg-gray-400'}`}
                        title={status}
                      ></span>
                    ))}
                    {dayStatuses.length > 3 && (
                      <span className={`text-[8px] ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>+</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileCalendarWidget;
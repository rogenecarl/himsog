'use client';

import React, { useState } from 'react';
import { Clock, Calendar, ChevronRight, ChevronDown, ChevronUp, CalendarPlus } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface AppointmentBase {
  startTime: Date | string;
  services?: Array<{
    service?: {
      name?: string;
      [key: string]: unknown;
    } | null;
    [key: string]: unknown;
  }>;
  provider?: {
    name?: string;
    healthcareName?: string;
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
}

interface NextAppointmentCardProps {
  appointment: AppointmentBase | undefined;
}

const MobileNextAppointment: React.FC<NextAppointmentCardProps> = ({ appointment }) => {
  const [showAllServices, setShowAllServices] = useState(false);

  // No appointment - show empty state
  if (!appointment) {
    return (
      <div className="px-5 py-2">
        <div className="bg-slate-900 rounded-3xl p-5 text-white shadow-lg shadow-slate-200 relative overflow-hidden">
          {/* Decorative circle */}
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/5 blur-2xl"></div>

          <div className="flex justify-between items-center mb-4 relative z-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-white/10 px-2 py-1 rounded-md">Next Up</span>
          </div>

          <div className="flex flex-col items-center justify-center py-4 relative z-10">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-3">
              <Calendar size={24} className="text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">No upcoming appointments</h3>
            <p className="text-slate-400 text-xs mb-4">Schedule your next appointment</p>
            <Link
              href="/browse-services"
              className="flex items-center gap-2 bg-white text-slate-900 px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-100 transition-colors"
            >
              <CalendarPlus size={16} />
              Book Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const services = appointment.services || [];
  const providerName = appointment.provider?.healthcareName || appointment.provider?.name || 'Provider';
  const appointmentTime = format(new Date(appointment.startTime), 'h:mm a');

  // Show first 2 services, rest hidden behind "show more"
  const visibleServices = showAllServices ? services : services.slice(0, 2);
  const hiddenCount = services.length - 2;

  return (
    <div className="px-5 py-2">
      <div className="bg-slate-900 rounded-3xl p-5 text-white shadow-lg shadow-slate-200 relative overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/5 blur-2xl"></div>

        <div className="flex justify-between items-center mb-4 relative z-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-white/10 px-2 py-1 rounded-md">Next Up</span>
          <span className="text-xs font-medium text-slate-300 flex items-center gap-1">
             {format(new Date(appointment.startTime), 'MMM d')} <Calendar size={12} />
          </span>
        </div>

        <h3 className="text-lg font-bold mb-1 relative z-10 line-clamp-1">{providerName}</h3>

        {/* Services Display */}
        {services.length > 0 && (
          <div className="mb-4 relative z-10">
            <div className="flex flex-wrap gap-1.5 mt-2">
              {visibleServices.map((appointmentService, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-white/10 text-slate-200 line-clamp-1"
                >
                  {appointmentService?.service?.name || 'Service'}
                </span>
              ))}
            </div>
            {hiddenCount > 0 && (
              <button
                onClick={() => setShowAllServices(!showAllServices)}
                className="flex items-center gap-1 mt-2 text-[10px] text-blue-400 font-medium hover:text-blue-300 transition-colors"
              >
                {showAllServices ? (
                  <>
                    Show less <ChevronUp size={12} />
                  </>
                ) : (
                  <>
                    +{hiddenCount} more service{hiddenCount > 1 ? 's' : ''} <ChevronDown size={12} />
                  </>
                )}
              </button>
            )}
          </div>
        )}

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
            <Clock size={14} className="text-blue-400" />
            <span className="text-sm font-medium">{appointmentTime}</span>
          </div>

          <button className="w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileNextAppointment;
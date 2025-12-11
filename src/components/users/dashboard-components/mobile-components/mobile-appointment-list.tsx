'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Clock, MapPin, MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

interface AppointmentBase {
  id: string;
  startTime: Date | string;
  status: string;
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
    address?: string | null;
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
}

interface AppointmentListProps {
  selectedDate: Date;
  appointments: AppointmentBase[];
}

// Individual appointment card with expandable services
const AppointmentCard: React.FC<{ appt: AppointmentBase }> = ({ appt }) => {
  const [showAllServices, setShowAllServices] = useState(false);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-emerald-100 text-emerald-700';
      case 'PENDING':
        return 'bg-amber-100 text-amber-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const services = appt.services || [];
  const providerName = appt.provider?.healthcareName || appt.provider?.name || 'Provider';
  const location = appt.provider?.address || 'Main Clinic';
  const appointmentTime = format(new Date(appt.startTime), 'h:mm a');

  // Show first 2 services, rest hidden behind "show more"
  const visibleServices = showAllServices ? services : services.slice(0, 2);
  const hiddenCount = services.length - 2;

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3 transition-transform active:scale-[0.99] duration-200">
      <div className="flex justify-between items-start">
        <div className="flex gap-3 items-start">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
            {appointmentTime.split(' ')[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-800 line-clamp-1">{providerName}</h4>
            {/* Services Display */}
            {services.length > 0 && (
              <div className="mt-1.5">
                <div className="flex flex-wrap gap-1">
                  {visibleServices.map((appointmentService, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-100 text-cyan-700 line-clamp-1"
                    >
                      {appointmentService?.service?.name || 'Service'}
                    </span>
                  ))}
                </div>
                {hiddenCount > 0 && (
                  <button
                    onClick={() => setShowAllServices(!showAllServices)}
                    className="flex items-center gap-1 mt-1 text-[10px] text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
                  >
                    {showAllServices ? (
                      <>
                        Show less <ChevronUp size={10} />
                      </>
                    ) : (
                      <>
                        +{hiddenCount} more service{hiddenCount > 1 ? 's' : ''} <ChevronDown size={10} />
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <button className="p-1 text-slate-300 hover:text-slate-500 shrink-0">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin size={14} />
          <span className="truncate max-w-[150px]">{location}</span>
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${getStatusStyle(appt.status)}`}>
          {appt.status}
        </span>
      </div>
    </div>
  );
};

const MobileAppointmentList: React.FC<AppointmentListProps> = ({ selectedDate, appointments }) => {
  const filteredAppointments = appointments.filter(appt =>
    new Date(appt.startTime).toDateString() === selectedDate.toDateString()
  ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <div className="px-5 pb-32">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 text-lg">
          Schedule
        </h3>
        <span className="text-sm text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">
            {format(selectedDate, 'MMM d, yyyy')}
        </span>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
             <Clock className="text-slate-300" size={24} />
          </div>
          <p className="text-slate-500 font-medium">No appointments scheduled.</p>
          <p className="text-slate-400 text-sm mt-1">Enjoy your free time!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map((appt) => (
            <AppointmentCard key={appt.id} appt={appt} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileAppointmentList;
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Star, CheckCircle, MapPin, User, ChevronRight, XCircle } from "lucide-react";
import Link from "next/link";
import { ReviewDialog } from "@/components/reviews/review-dialog";
import { useCanReview } from "@/hooks/use-review-hook";
import { toast } from "sonner";

interface PastAppointmentsProps {
  appointments: Array<{
    id: string;
    status: keyof typeof statusConfig;
    startTime: Date;
    endTime: Date;
    notes: string | null;
    activityNotes?: string | null;
    cancellationReason?: string | null;
    cancelledAt?: Date | null;
    provider: {
      id: string;
      healthcareName: string;
      coverPhoto?: string | null;
      address?: string | null;
      category?: {
        name: string;
        color: string;
        [key: string]: unknown;
      } | null;
      user?: {
        name: string;
        [key: string]: unknown;
      } | null;
      [key: string]: unknown;
    };
    services: Array<{
      service: {
        id: string;
        name: string;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    }>;
    review?: {
      id: string;
    } | null;
    [key: string]: unknown;
  }>;
}

const statusConfig = {
  PENDING: { label: "Pending", bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300" },
  CONFIRMED: { label: "Confirmed", bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300" },
  CANCELLED: { label: "Cancelled", bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300" },
  COMPLETED: { label: "Completed", bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300" },
  NO_SHOW: { label: "No Show", bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-300" },
};

type Appointment = PastAppointmentsProps["appointments"][number];

export default function PastAppointments({ appointments }: PastAppointmentsProps) {
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const handleReviewClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setReviewDialogOpen(true);
  };

  const handleReviewSuccess = () => {
    toast.success("Thank you for your review!");
  };

  const formatDateShort = (dateStr: Date) => {
    const date = new Date(dateStr);
    return {
      month: date.toLocaleString("en-US", { month: "short" }),
      day: date.getDate(),
      weekday: date.toLocaleString("en-US", { weekday: "long" }),
    };
  };

  const formatTime = (timeOrDate: string | Date) => {
    if (!timeOrDate) return "";

    if (typeof timeOrDate === "string" && (timeOrDate.includes("AM") || timeOrDate.includes("PM"))) {
      return timeOrDate;
    }

    if (timeOrDate instanceof Date || (typeof timeOrDate === "string" && timeOrDate.includes("-"))) {
      const date = new Date(timeOrDate);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, "0");
      return `${displayHours}:${displayMinutes} ${ampm}`;
    }

    const [hours, minutes] = timeOrDate.split(":");
    const hour = Number.parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <>
      {appointments.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-white/5 text-center">
          <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">No Past Appointments</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Your completed appointments will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((appointment) => {
            const status = statusConfig[appointment.status as keyof typeof statusConfig] || statusConfig.COMPLETED;
            const providerName = appointment?.provider?.healthcareName || "Unknown Provider";
            const providerOwner = appointment?.provider?.user?.name || "Provider";
            const categoryName = appointment?.provider?.category?.name;
            const appointmentDate = appointment?.startTime;
            const appointmentTime = appointment?.startTime;
            const services = appointment?.services || [];
            const dateInfo = appointmentDate ? formatDateShort(appointmentDate) : null;

            return (
              <div
                key={appointment.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 dark:border-white/5 transition-all hover:shadow-md hover:border-slate-200 dark:hover:border-white/10 flex flex-col h-full"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {categoryName && (
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider font-bold rounded">
                          {categoryName}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">
                      {providerName}
                    </h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
                    {status.label}
                  </span>
                </div>

                {/* Date & Time Block */}
                {dateInfo && (
                  <div className="flex items-center gap-3 mb-4 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm text-center min-w-[50px]">
                      <span className="block text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase">
                        {dateInfo.month}
                      </span>
                      <span className="block text-lg font-bold text-slate-800 dark:text-white leading-none">
                        {dateInfo.day}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {dateInfo.weekday}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {appointmentTime ? formatTime(appointmentTime) : "Time TBD"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Details List */}
                <div className="space-y-2 mb-4">
                  {appointment?.provider?.address && (
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 text-blue-500 dark:text-blue-400">
                        <MapPin size={14} />
                      </div>
                      <span className="truncate">{appointment.provider.address}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <div className="w-6 h-6 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center shrink-0 text-purple-500 dark:text-purple-400">
                      <User size={14} />
                    </div>
                    <span className="truncate">{providerOwner}</span>
                  </div>

                  {services.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 pl-9">
                      {services.slice(0, 2).map((svc, idx) => (
                        <span
                          key={svc.service?.id || idx}
                          className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md"
                        >
                          {svc.service?.name || "Service"}
                        </span>
                      ))}
                      {services.length > 2 && (
                        <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md">
                          +{services.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Activity Summary / Cancellation Reason */}
                <div className="flex-grow">
                  {appointment.status === "COMPLETED" && appointment.activityNotes && (
                    <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1 text-green-700 dark:text-green-300 font-semibold text-sm">
                        <FileText size={14} />
                        Activity Summary
                      </div>
                      <p className="text-xs text-green-800 dark:text-green-200 leading-relaxed">
                        {appointment.activityNotes}
                      </p>
                    </div>
                  )}

                  {appointment.status === "CANCELLED" && appointment.cancellationReason && (
                    <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1 text-red-700 dark:text-red-300 font-semibold text-sm">
                        <XCircle size={14} />
                        Cancellation Reason
                      </div>
                      <p className="text-xs text-red-800 dark:text-red-200 leading-relaxed">
                        {appointment.cancellationReason}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer / Actions */}
                <div className="mt-auto">
                  <div className="h-px bg-slate-100 dark:border-white/5 w-full mb-3"></div>

                  <div className="flex flex-wrap items-center justify-between gap-y-3">
                    <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-sm">
                      <CheckCircle size={16} />
                      <span>{appointment.status === "CANCELLED" ? "Cancelled" : "Service Complete"}</span>
                    </div>

                    <div className="flex gap-2">
                      {appointment.status === "COMPLETED" && (
                        <ReviewButton
                          appointmentId={appointment.id}
                          onReviewClick={() => handleReviewClick(appointment)}
                        />
                      )}
                      <Link href={`/appointments/${appointment.id}`}>
                        <button className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium rounded-lg shadow-md hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center gap-1">
                          View Details <ChevronRight size={14} />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Dialog */}
      {selectedAppointment && (
        <ReviewDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          appointmentId={selectedAppointment.id}
          providerId={selectedAppointment.provider.id}
          providerName={selectedAppointment.provider.healthcareName}
          onSuccess={handleReviewSuccess}
        />
      )}
    </>
  );
}

// Separate component to use the hook for each appointment
function ReviewButton({
  appointmentId,
  onReviewClick
}: {
  appointmentId: string;
  onReviewClick: () => void;
}) {
  const { data: canReviewData, isLoading } = useCanReview(appointmentId);

  const canReview = canReviewData?.success && canReviewData?.canReview === true;

  if (isLoading) {
    return (
      <Button
        size="sm"
        variant="outline"
        className="text-sm border-slate-200 dark:border-white/10"
        disabled
      >
        <Star className="h-4 w-4 mr-1" />
        Checking...
      </Button>
    );
  }

  if (canReview) {
    return (
      <button
        onClick={onReviewClick}
        className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-sm font-medium rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex items-center gap-1.5"
      >
        <Star size={14} className="text-amber-400 fill-amber-400" />
        <span>Leave Review</span>
      </button>
    );
  }

  return (
    <button
      disabled
      className="px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 text-sm font-medium rounded-lg flex items-center gap-1.5 cursor-not-allowed"
    >
      <CheckCircle size={14} />
      <span>Reviewed</span>
    </button>
  );
}

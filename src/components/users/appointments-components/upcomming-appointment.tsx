"use client";

import { useState } from "react";
import { Calendar, MapPin, User, X, Loader2, Navigation } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { USER_CANCELLATION_REASONS } from "@/lib/constants/cancellation-reasons";
import { useCancelUserAppointment } from "@/hooks/use-get-user-appointment-hooks";

interface UpcomingAppointmentsProps {
  appointments: Array<{
    id: string;
    status: keyof typeof statusConfig;
    startTime: Date;
    endTime: Date;
    notes: string | null;
    provider: {
      id: string;
      healthcareName: string;
      coverPhoto?: string | null;
      address?: string | null;
      latitude?: number | null;
      longitude?: number | null;
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
    [key: string]: unknown;
  }>;
  onAppointmentCancelled?: () => void;
}

const statusConfig = {
  PENDING: { label: "Pending", bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300" },
  CONFIRMED: { label: "Confirmed", bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300" },
  CANCELLED: { label: "Cancelled", bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300" },
  COMPLETED: { label: "Completed", bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300" },
  NO_SHOW: { label: "No Show", bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-300" },
};

export default function UpcomingAppointments({
  appointments,
  onAppointmentCancelled,
}: UpcomingAppointmentsProps) {
  const router = useRouter();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelNotes, setCancelNotes] = useState("");

  const cancelMutation = useCancelUserAppointment();
  const isCancelling = cancelMutation.isPending;

  // Navigate to map with destination coordinates for directions
  const handleNavigateToProvider = (provider: {
    id: string;
    healthcareName: string;
    latitude?: number | null;
    longitude?: number | null;
  }) => {
    if (!provider.latitude || !provider.longitude) {
      return;
    }
    // Navigate to map page with destination coordinates
    const params = new URLSearchParams({
      dest_lat: provider.latitude.toString(),
      dest_lng: provider.longitude.toString(),
      dest_name: provider.healthcareName,
      dest_id: provider.id,
    });
    router.push(`/map?${params.toString()}`);
  };

  const handleCancelClick = (appointmentId: string) => {
    setSelectedAppointment(appointmentId);
    setShowCancelDialog(true);
  };

  const handleCancelClose = () => {
    if (!isCancelling) {
      setShowCancelDialog(false);
      setSelectedAppointment(null);
      setCancelReason("");
      setCancelNotes("");
    }
  };

  const handleCancelSubmit = () => {
    if (!selectedAppointment || !cancelReason) {
      return;
    }

    cancelMutation.mutate(
      {
        appointmentId: selectedAppointment,
        reason: cancelReason,
        notes: cancelNotes || undefined,
      },
      {
        onSuccess: () => {
          handleCancelClose();
          onAppointmentCancelled?.();
        },
      }
    );
  };

  const formatDateShort = (dateStr: Date) => {
    const date = new Date(dateStr);
    return {
      month: date.toLocaleString("en-US", { month: "short" }),
      day: date.getDate(),
      weekday: date.toLocaleString("en-US", { weekday: "long" }),
    };
  };

  const formatTime = (dateStr: Date) => {
    const date = new Date(dateStr);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  return (
    <>
      {appointments.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-white/5 text-center">
          <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
            No upcoming appointments
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            You don&apos;t have any scheduled appointments
          </p>
          <Button className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100" asChild>
            <Link href="/browse-services">Book Your First Appointment</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((apt) => {
            const status = apt.status as keyof typeof statusConfig;
            const statusInfo = statusConfig[status] || statusConfig.PENDING;
            const providerName = apt?.provider?.healthcareName || "Healthcare Provider";
            const providerOwner = apt?.provider?.user?.name || "Provider";
            const categoryName = apt?.provider?.category?.name;
            const dateInfo = formatDateShort(apt.startTime);
            const services = apt?.services || [];

            return (
              <div
                key={apt.id}
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
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.text}`}>
                    {statusInfo.label}
                  </span>
                </div>

                {/* Date & Time Block */}
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
                      {formatTime(apt.startTime)}
                    </p>
                  </div>
                </div>

                {/* Details List */}
                <div className="space-y-2 mb-4 flex-grow">
                  {apt?.provider?.address && (
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 text-blue-500 dark:text-blue-400">
                        <MapPin size={14} />
                      </div>
                      <span className="truncate flex-1">{apt.provider.address}</span>
                      {apt.provider.latitude && apt.provider.longitude && (
                        <button
                          onClick={() => handleNavigateToProvider(apt.provider)}
                          className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center shrink-0 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                          title="Get directions"
                          aria-label="Navigate to provider location"
                        >
                          <Navigation size={14} />
                        </button>
                      )}
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

                {/* Footer / Actions */}
                <div className="mt-auto">
                  <div className="h-px bg-slate-100 dark:border-white/5 w-full mb-3"></div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Total</span>
                      <span className="text-lg font-bold text-slate-900 dark:text-white">
                        {apt.totalPrice ? `₱${Number(apt.totalPrice).toFixed(2)}` : "Free"}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {(status === "PENDING" || status === "CONFIRMED") && (
                        <button
                          onClick={() => handleCancelClick(apt.id)}
                          className="px-4 py-2 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-sm font-medium rounded-lg shadow-sm hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors flex items-center gap-2"
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Appointment Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={handleCancelClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Please let us know why you need to cancel this appointment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancel-reason">Reason for cancellation</Label>
              <Select value={cancelReason} onValueChange={setCancelReason}>
                <SelectTrigger id="cancel-reason">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {USER_CANCELLATION_REASONS.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cancel-notes">Additional notes (Optional)</Label>
              <Textarea
                id="cancel-notes"
                placeholder="Any additional details you'd like to share..."
                value={cancelNotes}
                onChange={(e) => setCancelNotes(e.target.value)}
                className="min-h-[80px] resize-none"
                disabled={isCancelling}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelClose}
              disabled={isCancelling}
            >
              Keep Appointment
            </Button>
            <Button
              type="button"
              onClick={handleCancelSubmit}
              disabled={isCancelling || !cancelReason}
              variant="destructive"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Cancelling...
                </>
              ) : (
                "Cancel Appointment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

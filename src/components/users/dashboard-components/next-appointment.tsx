"use client";

import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Appointment {
  id: string;
  status: keyof typeof statusColors;
  startTime: Date;
  endTime: Date;
  provider: {
    id: string;
    healthcareName: string;
    coverPhoto?: string | null;
    address?: string | null;
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
}

interface NextAppointmentProps {
  appointments: Appointment[];
}

const statusColors = {
  PENDING: { bg: "bg-yellow-100", text: "text-yellow-800" },
  CONFIRMED: { bg: "bg-green-100", text: "text-green-800" },
  CANCELLED: { bg: "bg-red-100", text: "text-red-800" },
  COMPLETED: { bg: "bg-blue-100", text: "text-blue-800" },
  NO_SHOW: { bg: "bg-gray-100", text: "text-gray-800" },
};

export default function NextAppointment({
  appointments,
}: NextAppointmentProps) {
  const formatDate = (dateStr: Date) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: Date) => {
    const date = new Date(dateStr);
    // Use local time components to avoid timezone conversion issues
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0) + status.slice(1).toLowerCase().replace("_", " ");
  };

  // Get the next upcoming appointment
  const nextAppointment = appointments.length > 0 ? appointments[0] : null;

  return (
    <Card className="bg-white dark:bg-[#1E293B] border-gray-200 dark:border-white/10">
      <CardHeader className="">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
              Next Appointment
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-slate-400">
              Your upcoming appointment
            </CardDescription>
          </div>
          {appointments.length > 1 && (
            <Button variant="ghost" size="sm" asChild>
              <Link
                href="/appointments"
                className="text-cyan-600 hover:text-cyan-700"
              >
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!nextAppointment ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-gray-400 dark:text-slate-500" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              No upcoming appointments
            </h3>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
              Schedule your next appointment
            </p>
            <Button className="bg-cyan-700 hover:bg-cyan-800" asChild>
              <Link href="/find-services">Book Appointment</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Card className="border-l-4 border-l-cyan-600 hover:shadow-md transition-shadow dark:bg-slate-800 dark:border-white/10">
              <CardContent className="pt-4 pb-4">
                {/* Header: Title and Badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-semibold text-base text-gray-900 dark:text-white flex-1">
                    {nextAppointment?.provider?.healthcareName ||
                      "Healthcare Provider"}
                  </h3>
                  <Badge
                    variant="secondary"
                    className={`${
                      statusColors[
                        nextAppointment.status as keyof typeof statusColors
                      ]?.bg || statusColors.PENDING.bg
                    } ${
                      statusColors[
                        nextAppointment.status as keyof typeof statusColors
                      ]?.text || statusColors.PENDING.text
                    } text-xs`}
                  >
                    {getStatusLabel(nextAppointment.status)}
                  </Badge>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-slate-400">
                      <span className="font-medium text-gray-900 dark:text-white">Date:</span>{" "}
                      <span className="font-semibold text-gray-900 dark:text-white bg-cyan-50 dark:bg-cyan-900/30 px-2 py-1 rounded">
                        {formatDate(nextAppointment.startTime)}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-slate-400">
                      <span className="font-medium text-gray-900 dark:text-white">Time:</span>{" "}
                      <span className="font-bold text-lg text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30 px-2 py-1 rounded">
                        {formatTime(nextAppointment.startTime)}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-500 dark:text-slate-400 shrink-0" />
                    <span className="text-gray-600 dark:text-slate-400 truncate">
                      {nextAppointment?.provider?.address || "Location TBD"}
                    </span>
                  </div>
                </div>

                {/* Services */}
                {nextAppointment?.services &&
                  nextAppointment.services.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Services:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {nextAppointment.services.map(
                          (appointmentService: { service?: { name: string } }, index: number) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800"
                            >
                              {appointmentService?.service?.name || "Service"}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* View Details Button */}
                <Button
                  variant="outline"
                  className="w-full h-9 text-sm bg-cyan-800 text-white"
                  asChild
                >
                  <Link href={`/appointments`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>

            {/* View All Appointments Link */}
            {appointments.length > 1 && (
              <div className="text-center">
                <Button variant="ghost" size="sm" asChild>
                  <Link
                    href="/appointments"
                    className="text-cyan-600 hover:text-cyan-700"
                  >
                    View All {appointments.length} Appointments
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

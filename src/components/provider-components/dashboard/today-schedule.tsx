"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TodayScheduleSkeleton } from "../skeletons/activity-skeleton";
import { useTodayAppointments } from "@/hooks/use-provider-dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  RefreshCw,
  Calendar,
  Clock,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  NO_SHOW: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400",
};

export function TodaySchedule() {
  const {
    data: appointments,
    isLoading,
    isError,
    error,
    refetch,
  } = useTodayAppointments();

  // Loading state
  if (isLoading) {
    return <TodayScheduleSkeleton count={3} />;
  }

  // Error state
  if (isError) {
    return (
      <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error?.message}</span>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!appointments || appointments.length === 0) {
    return (
      <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white">
            <Calendar className="h-5 w-5 text-cyan-500" />
            Today&apos;s Schedule
          </CardTitle>
          <Link href="/provider/appointments">
            <Button variant="ghost" size="sm" className="text-cyan-600 dark:text-cyan-400">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">No appointments today</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
              Enjoy your free day or check upcoming appointments
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Success state
  return (
    <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white">
          <Calendar className="h-5 w-5 text-cyan-500" />
          Today&apos;s Schedule
        </CardTitle>
        <Link href="/provider/appointments">
          <Button variant="ghost" size="sm" className="text-cyan-600 dark:text-cyan-400">
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {appointments.slice(0, 5).map((appointment) => (
          <div
            key={appointment.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            {/* Time */}
            <div className="flex-shrink-0 text-center min-w-[60px] bg-slate-100 dark:bg-slate-800 rounded-lg p-2">
              <Clock className="h-3 w-3 text-slate-500 dark:text-slate-400 mx-auto mb-1" />
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {format(new Date(appointment.startTime), "h:mm")}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {format(new Date(appointment.startTime), "a")}
              </p>
            </div>

            {/* Patient Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={appointment.user.image || undefined} />
                  <AvatarFallback className="text-xs bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400">
                    {appointment.patientName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {appointment.patientName}
                </p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                {appointment.services.map((s) => s.service.name).join(", ")}
              </p>
            </div>

            {/* Status Badge */}
            <Badge
              variant="secondary"
              className={`${statusColors[appointment.status as keyof typeof statusColors]} flex-shrink-0`}
            >
              {appointment.status.charAt(0) +
                appointment.status.slice(1).toLowerCase()}
            </Badge>
          </div>
        ))}

        {appointments.length > 5 && (
          <Link href="/provider/appointments">
            <Button variant="outline" className="w-full mt-2" size="sm">
              View {appointments.length - 5} more appointments
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import CalendarMonth from "@/components/users/dashboard-components/booking-calendar";
import StatusLegend from "@/components/users/dashboard-components/status-legend";
import NextAppointment from "@/components/users/dashboard-components/next-appointment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { useUserDashboardData } from "@/hooks/use-get-user-appointment-hooks";
import { useUser } from "@/context/UserContext";

// Mobile components
import MobileHeader from "@/components/mobile-header";
import MobileNextAppointment from "@/components/users/dashboard-components/mobile-components/mobile-next-appointment";
import MobileStatsOverview from "@/components/users/dashboard-components/mobile-components/mobile-stats-overview";
import MobileCalendarWidget from "@/components/users/dashboard-components/mobile-components/mobile-booking-calendar";
import MobileAppointmentList from "@/components/users/dashboard-components/mobile-components/mobile-appointment-list";
import BottomNavigation from "@/components/mobile-bottom-nav";

export default function UserDashboardPage() {
    const user = useUser();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    // OPTIMIZED: Parallel data fetching using combined hook
    const {
        allAppointments,
        upcomingAppointments,
        stats,
        isLoadingAll,
        isLoadingUpcoming,
        isLoadingStats,
    } = useUserDashboardData();

    const goToPreviousMonth = () => {
        setCurrentDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
        );
    };

    const goToNextMonth = () => {
        setCurrentDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
        );
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // Get next upcoming appointment
    const nextAppointment = upcomingAppointments?.[0];

    return (
        <>
        {/* Mobile View */}
        <div className="md:hidden min-h-screen bg-gray-50 dark:bg-[#0B0F19]">
            <MobileHeader userName={user?.name || "User"} subtitle="Dashboard" userImage={user?.image} />

            {isLoadingUpcoming ? (
                <div className="px-5 py-2">
                    <Skeleton className="h-40 w-full rounded-3xl" />
                </div>
            ) : (
                <MobileNextAppointment appointment={nextAppointment} />
            )}

            {isLoadingStats ? (
                <div className="grid grid-cols-2 gap-3 px-5 pt-4 pb-2">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-2xl" />
                    ))}
                </div>
            ) : (
                <MobileStatsOverview stats={stats} />
            )}

            {isLoadingAll ? (
                <div className="px-5 py-4">
                    <Skeleton className="h-80 w-full rounded-3xl" />
                </div>
            ) : (
                <MobileCalendarWidget
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    appointments={allAppointments}
                />
            )}

            {isLoadingAll ? (
                <div className="px-5 pb-32 space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-2xl" />
                    ))}
                </div>
            ) : (
                <MobileAppointmentList
                    selectedDate={selectedDate}
                    appointments={allAppointments}
                />
            )}

            <BottomNavigation />
        </div>

        {/* Desktop View */}
        <div className="hidden md:block min-h-screen bg-gray-50 dark:bg-[#0B0F19]">
            {/* Header */}
            <header >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        Welcome Back, {user?.name}
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">
                        Manage your booking schedule and appointments
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {isLoadingStats ? (
                        <>
                            {[...Array(4)].map((_, i) => (
                                <Card key={i} className="p-4 sm:p-6 bg-white dark:bg-[#1E293B] border-gray-200 dark:border-white/10">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-16 bg-slate-200 dark:bg-white/10" />
                                            <Skeleton className="h-8 w-12 bg-slate-200 dark:bg-white/10" />
                                        </div>
                                        <Skeleton className="h-12 w-12 rounded-full bg-slate-200 dark:bg-white/10" />
                                    </div>
                                    <Skeleton className="h-3 w-24 bg-slate-200 dark:bg-white/10 mt-2" />
                                </Card>
                            ))}
                        </>
                    ) : (
                        <>
                            <Card className="border-l-4 border-l-yellow-500 dark:bg-[#1E293B] dark:border-white/10">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-slate-400">
                                        Upcoming
                                    </CardTitle>
                                    <Clock className="h-4 w-4 text-yellow-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {stats?.upcoming || 0}
                                    </div>
                                    <p className="mt-1 text-xs text-gray-600 dark:text-slate-400">Scheduled ahead</p>
                                </CardContent>
                            </Card>

                            <Card className="border-l-4 border-l-green-500 dark:bg-[#1E293B] dark:border-white/10">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-slate-400">
                                        Completed
                                    </CardTitle>
                                    <TrendingUp className="h-6 w-6 text-green-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {stats?.completed || 0}
                                    </div>
                                    <p className="mt-1 text-xs text-gray-600 dark:text-slate-400">
                                        Successfully completed
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-l-4 border-l-blue-500 dark:bg-[#1E293B] dark:border-white/10">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-slate-400">
                                        Total
                                    </CardTitle>
                                    <Calendar className="h-4 w-4 text-blue-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {stats?.total || 0}
                                    </div>
                                    <p className="mt-1 text-xs text-gray-600 dark:text-slate-400">All appointments</p>
                                </CardContent>
                            </Card>

                            <Card className="border-l-4 border-l-red-500 dark:bg-[#1E293B] dark:border-white/10">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-slate-400">
                                        Cancelled
                                    </CardTitle>
                                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {stats?.cancelled || 0}
                                    </div>
                                    <p className="mt-1 text-xs text-gray-600 dark:text-slate-400">Cancelled visits</p>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Calendar - Main Section */}
                    <div className="lg:col-span-2">
                        {isLoadingAll ? (
                            <Card className="bg-white dark:bg-[#1E293B] border-gray-200 dark:border-white/10">
                                <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-white/5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <Skeleton className="h-6 w-24 bg-slate-200 dark:bg-white/10" />
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-8 w-8 bg-slate-200 dark:bg-white/10" />
                                            <Skeleton className="h-6 w-32 bg-slate-200 dark:bg-white/10" />
                                            <Skeleton className="h-8 w-8 bg-slate-200 dark:bg-white/10" />
                                            <Skeleton className="h-8 w-16 bg-slate-200 dark:bg-white/10" />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-0">
                                    {/* Day headers skeleton */}
                                    <div className="grid grid-cols-7 gap-0 bg-slate-50 dark:bg-[#0B0F19] border-b border-slate-200 dark:border-white/5">
                                        {[...Array(7)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="h-12 flex items-center justify-center"
                                            >
                                                <Skeleton className="h-4 w-8 bg-slate-200 dark:bg-white/10" />
                                            </div>
                                        ))}
                                    </div>
                                    {/* Calendar grid skeleton */}
                                    <div className="grid grid-cols-7 gap-0">
                                        {[...Array(35)].map((_, i) => (
                                            <div key={i} className="min-h-24 border-r border-b border-slate-200 dark:border-white/5 p-2 bg-white dark:bg-[#1E293B]">
                                                <Skeleton className="h-4 w-6 bg-slate-200 dark:bg-white/10 mb-2" />
                                                <Skeleton className="h-6 w-full bg-slate-200 dark:bg-white/10 mb-1" />
                                                <Skeleton className="h-6 w-3/4 bg-slate-200 dark:bg-white/10" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        ) : (
                            <CalendarMonth
                                currentDate={currentDate}
                                onPrevMonth={goToPreviousMonth}
                                onNextMonth={goToNextMonth}
                                onToday={goToToday}
                                appointments={allAppointments}
                            />
                        )}
                    </div>

                    {/* Sidebar - Status Legend & Next Appointment */}
                    <div className="space-y-6">
                        {/* Status Legend */}
                        {isLoadingUpcoming ? (
                            <Card className="bg-white dark:bg-[#1E293B] border-gray-200 dark:border-white/10">
                                <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-white/5">
                                    <Skeleton className="h-5 w-32 bg-slate-200 dark:bg-white/10" />
                                </div>
                                <div className="p-4 sm:p-6 space-y-3">
                                    {[...Array(5)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between gap-3"
                                        >
                                            <div className="flex items-center gap-2 flex-1">
                                                <Skeleton className="w-3 h-3 rounded-full bg-slate-200 dark:bg-white/10" />
                                                <div className="flex-1 space-y-1">
                                                    <Skeleton className="h-4 w-20 bg-slate-200 dark:bg-white/10" />
                                                    <Skeleton className="h-3 w-32 bg-slate-200 dark:bg-white/10" />
                                                </div>
                                            </div>
                                            <Skeleton className="h-5 w-16 bg-slate-200 dark:bg-white/10 rounded-full" />
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        ) : (
                            <StatusLegend />
                        )}

                        {/* Next Appointment */}
                        {isLoadingUpcoming ? (
                            <Card className="bg-white dark:bg-[#1E293B] border-gray-200 dark:border-white/10">
                                <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-white/5">
                                    <Skeleton className="h-6 w-40 bg-slate-200 dark:bg-white/10 mb-2" />
                                    <Skeleton className="h-4 w-32 bg-slate-200 dark:bg-white/10" />
                                </div>
                                <div className="p-4 sm:p-6 space-y-3">
                                    <Card className="border-l-4 border-l-slate-300 dark:border-l-slate-600 bg-white dark:bg-slate-800 border-slate-200 dark:border-white/5">
                                        <div className="p-4 space-y-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <Skeleton className="h-5 w-32 bg-slate-200 dark:bg-white/10" />
                                                <Skeleton className="h-5 w-20 bg-slate-200 dark:bg-white/10" />
                                            </div>
                                            <Skeleton className="h-5 w-24 bg-slate-200 dark:bg-white/10" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-full bg-slate-200 dark:bg-white/10" />
                                                <Skeleton className="h-4 w-full bg-slate-200 dark:bg-white/10" />
                                                <Skeleton className="h-4 w-3/4 bg-slate-200 dark:bg-white/10" />
                                            </div>
                                            <Skeleton className="h-8 w-full bg-slate-200 dark:bg-white/10" />
                                        </div>
                                    </Card>
                                </div>
                            </Card>
                        ) : (
                            <NextAppointment appointments={upcomingAppointments} />
                        )}
                    </div>
                </div>

            </main>
        </div>
        </>
    );
}

"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import UpcomingAppointments from "@/components/users/appointments-components/upcomming-appointment";
import PastAppointments from "@/components/users/appointments-components/past-appointment";
import {
    useUserUpcomingAppointments,
    useUserPastAppointments,
} from "@/hooks/use-get-user-appointment-hooks";

export default function UserAppointmentPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

    // Always fetch upcoming appointments (default tab)
    const { data: upcomingAppointments = [], isLoading: isLoadingUpcoming } = useUserUpcomingAppointments();

    // OPTIMIZED: Lazy-load past appointments only when tab is active
    // This prevents unnecessary API calls when user only views upcoming appointments
    const { data: pastAppointments = [], isLoading: isLoadingPast } = useUserPastAppointments({
        enabled: activeTab === "past",
    });

    const upcomingCount = upcomingAppointments.length;
    const pastCount = pastAppointments.length;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] font-sans text-slate-900 dark:text-white pb-20">
            {/* Header Section */}
            <header className="sticky top-0 z-30 bg-slate-50/90 dark:bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-200/50 dark:border-white/5 supports-[backdrop-filter]:bg-slate-50/60 dark:supports-[backdrop-filter]:bg-[#0B0F19]/60">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 py-4">
                        {/* Mobile Back Button */}
                        <button
                            onClick={() => router.back()}
                            className="sm:hidden p-2.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition active:scale-95"
                            aria-label="Go back"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Appointments</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium hidden sm:block">View and manage your upcoming and past appointments</p>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="pb-4">
                        <div className="bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl flex relative w-full md:w-96">
                            <button
                                onClick={() => setActiveTab("upcoming")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                                    activeTab === "upcoming"
                                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                                }`}
                            >
                                Upcoming
                                <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                    activeTab === "upcoming"
                                        ? "bg-slate-100 dark:bg-slate-600 text-slate-900 dark:text-white"
                                        : "bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                                }`}>
                                    {upcomingCount}
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab("past")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                                    activeTab === "past"
                                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                                }`}
                            >
                                Past
                                <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                    activeTab === "past"
                                        ? "bg-slate-100 dark:bg-slate-600 text-slate-900 dark:text-white"
                                        : "bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                                }`}>
                                    {pastCount}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === "upcoming" && (
                    <>
                        {isLoadingUpcoming ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-white/5 animate-pulse">
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-3"></div>
                                        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-4"></div>
                                        <div className="h-16 bg-slate-100 dark:bg-slate-700/50 rounded-xl mb-4"></div>
                                        <div className="space-y-2">
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <UpcomingAppointments appointments={upcomingAppointments} />
                        )}
                    </>
                )}

                {activeTab === "past" && (
                    <>
                        {isLoadingPast ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-white/5 animate-pulse">
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-3"></div>
                                        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-4"></div>
                                        <div className="h-16 bg-slate-100 dark:bg-slate-700/50 rounded-xl mb-4"></div>
                                        <div className="space-y-2">
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <PastAppointments appointments={pastAppointments} />
                        )}
                    </>
                )}

                <div className="mt-12 text-center border-t border-slate-200 dark:border-white/5 pt-8">
                    <p className="text-sm text-slate-400 dark:text-slate-500">
                        Need help with your appointments? <a href="#" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Contact Support</a>
                    </p>
                </div>
            </main>
        </div>
    );
}

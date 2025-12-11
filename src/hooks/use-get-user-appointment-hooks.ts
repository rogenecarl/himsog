"use client";

import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    getUserAppointments,
    getUserAppointmentById,
    getUserUpcomingAppointments,
    getUserPastAppointments,
    getAppointmentStats,
} from "@/actions/appointment/get-user-appointment-actions";
import { cancelAppointmentByUser } from "@/actions/appointment/cancel-appointment-actions";
import { queryConfigDefaults } from "@/lib/query-keys";

// Query keys for appointment-related queries
export const userAppointmentKeys = {
    all: ["userAppointments"] as const,
    lists: () => [...userAppointmentKeys.all, "list"] as const,
    list: (filters?: string) => [...userAppointmentKeys.lists(), { filters }] as const,
    details: () => [...userAppointmentKeys.all, "detail"] as const,
    detail: (id: string) => [...userAppointmentKeys.details(), id] as const,
    upcoming: () => [...userAppointmentKeys.all, "upcoming"] as const,
    past: () => [...userAppointmentKeys.all, "past"] as const,
    stats: () => [...userAppointmentKeys.all, "stats"] as const,
};

// Hook to get all user appointments
export function useUserAppointments() {
    return useQuery({
        queryKey: userAppointmentKeys.lists(),
        queryFn: async () => {
            const result = await getUserAppointments();
            if (!result.success) {
                throw new Error(result.error || "Failed to fetch appointments");
            }
            return result.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
    });
}

// Hook to get a specific appointment by ID
export function useUserAppointmentById(appointmentId: string) {
    return useQuery({
        queryKey: userAppointmentKeys.detail(appointmentId),
        queryFn: async () => {
            const result = await getUserAppointmentById(appointmentId);
            if (!result.success) {
                throw new Error(result.error || "Failed to fetch appointment");
            }
            return result.data;
        },
        enabled: !!appointmentId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
    });
}

// Hook to get upcoming appointments
export function useUserUpcomingAppointments() {
    return useQuery({
        queryKey: userAppointmentKeys.upcoming(),
        queryFn: async () => {
            const result = await getUserUpcomingAppointments();
            if (!result.success) {
                throw new Error(result.error || "Failed to fetch upcoming appointments");
            }
            return result.data;
        },
        staleTime: 1000 * 60 * 2, // 2 minutes (more frequent updates for upcoming)
        gcTime: 1000 * 60 * 10, // 10 minutes
        refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    });
}

// Hook to get past appointments (supports lazy loading with enabled option)
export function useUserPastAppointments(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: userAppointmentKeys.past(),
        queryFn: async () => {
            const result = await getUserPastAppointments();
            if (!result.success) {
                throw new Error(result.error || "Failed to fetch past appointments");
            }
            return result.data;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes (past appointments change less frequently)
        gcTime: 1000 * 60 * 30, // 30 minutes
        // Enable lazy loading - only fetch when explicitly enabled (default: true)
        enabled: options?.enabled ?? true,
    });
}

// Hook to get appointment statistics
export function useAppointmentStats() {
    return useQuery({
        queryKey: userAppointmentKeys.stats(),
        queryFn: async () => {
            const result = await getAppointmentStats();
            if (!result.success) {
                throw new Error(result.error || "Failed to fetch appointment stats");
            }
            return result.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 15, // 15 minutes
    });
}

// Hook to cancel a user appointment
export function useCancelUserAppointment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            appointmentId,
            reason,
            notes,
        }: {
            appointmentId: string;
            reason: string;
            notes?: string;
        }) => {
            const result = await cancelAppointmentByUser({
                appointmentId,
                reason,
                notes,
            });
            if (!result.success) {
                throw new Error(result.error || "Failed to cancel appointment");
            }
            return result.data;
        },
        onSuccess: () => {
            toast.success("Appointment cancelled successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to cancel appointment");
        },
        onSettled: () => {
            // Invalidate all user appointment queries to refetch fresh data
            queryClient.invalidateQueries({ queryKey: userAppointmentKeys.all });
        },
    });
}

// ============================================================================
// OPTIMIZED: Combined hook that fetches ALL user dashboard data in parallel
// ============================================================================

/**
 * Hook to fetch ALL user dashboard data in parallel using useQueries
 * This eliminates waterfall loading and improves perceived performance
 */
export function useUserDashboardData() {
    const results = useQueries({
        queries: [
            {
                queryKey: userAppointmentKeys.lists(),
                queryFn: async () => {
                    const result = await getUserAppointments();
                    if (!result.success) throw new Error(result.error);
                    return result.data;
                },
                ...queryConfigDefaults.appointments,
            },
            {
                queryKey: userAppointmentKeys.upcoming(),
                queryFn: async () => {
                    const result = await getUserUpcomingAppointments();
                    if (!result.success) throw new Error(result.error);
                    return result.data;
                },
                ...queryConfigDefaults.appointments,
            },
            {
                queryKey: userAppointmentKeys.stats(),
                queryFn: async () => {
                    const result = await getAppointmentStats();
                    if (!result.success) throw new Error(result.error);
                    return result.data;
                },
                ...queryConfigDefaults.dashboard,
            },
        ],
    });

    // Destructure results for easier access
    const [allQuery, upcomingQuery, statsQuery] = results;

    return {
        // Individual data
        allAppointments: allQuery.data ?? [],
        upcomingAppointments: upcomingQuery.data ?? [],
        stats: statsQuery.data,
        // Loading states
        isLoading: results.some((r) => r.isLoading),
        isLoadingAll: allQuery.isLoading,
        isLoadingUpcoming: upcomingQuery.isLoading,
        isLoadingStats: statsQuery.isLoading,
        // Error states
        hasError: results.some((r) => r.isError),
        errors: results.filter((r) => r.error).map((r) => r.error),
    };
}

// Type exports for convenience
export type UserAppointment = Awaited<ReturnType<typeof getUserAppointments>>["data"][number];
export type UserAppointmentDetail = Exclude<Awaited<ReturnType<typeof getUserAppointmentById>>["data"], null>;
export type AppointmentStats = Awaited<ReturnType<typeof getAppointmentStats>>["data"];
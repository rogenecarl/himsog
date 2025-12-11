"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getDashboardStats,
  getTodayAppointments,
  getRecentActivities,
  type DashboardStats,
  type TodayAppointment,
  type Activity,
} from "@/actions/provider/dashboard-actions";
import { providerQueryKeys, queryConfigDefaults } from "@/lib/query-keys";

/**
 * Hook to fetch dashboard statistics
 * - Auto-refreshes every minute
 * - Refetches on window focus
 * - Retries with exponential backoff
 */
export function useDashboardStats() {
  return useQuery<DashboardStats, Error>({
    queryKey: providerQueryKeys.dashboard.stats(),
    queryFn: async () => {
      const result = await getDashboardStats();
      if (!result.success) throw new Error(result.error);
      return result.data!;
    },
    staleTime: queryConfigDefaults.dashboard.staleTime,
    gcTime: queryConfigDefaults.dashboard.gcTime,
    refetchInterval: queryConfigDefaults.dashboard.refetchInterval,
    refetchOnWindowFocus: queryConfigDefaults.dashboard.refetchOnWindowFocus,
    retry: queryConfigDefaults.dashboard.retry,
    retryDelay: queryConfigDefaults.dashboard.retryDelay,
  });
}

/**
 * Hook to fetch today's appointments for the schedule view
 * - Auto-refreshes every minute
 * - Refetches on window focus
 */
export function useTodayAppointments() {
  return useQuery<TodayAppointment[], Error>({
    queryKey: providerQueryKeys.dashboard.todayAppointments(),
    queryFn: async () => {
      const result = await getTodayAppointments();
      if (!result.success) throw new Error(result.error);
      return result.data!;
    },
    staleTime: queryConfigDefaults.dashboard.staleTime,
    gcTime: queryConfigDefaults.dashboard.gcTime,
    refetchInterval: queryConfigDefaults.dashboard.refetchInterval,
    refetchOnWindowFocus: queryConfigDefaults.dashboard.refetchOnWindowFocus,
    retry: queryConfigDefaults.dashboard.retry,
    retryDelay: queryConfigDefaults.dashboard.retryDelay,
  });
}

/**
 * Hook to fetch recent activities (bookings, reviews, messages)
 * - Slightly longer stale time as it's less critical
 * - Refetches on window focus
 */
export function useRecentActivities(limit = 10) {
  return useQuery<Activity[], Error>({
    queryKey: providerQueryKeys.dashboard.activities(limit),
    queryFn: async () => {
      const result = await getRecentActivities(limit);
      if (!result.success) throw new Error(result.error);
      return result.data!;
    },
    staleTime: 60000, // 1 minute - activities are less time-critical
    gcTime: queryConfigDefaults.dashboard.gcTime,
    refetchOnWindowFocus: queryConfigDefaults.dashboard.refetchOnWindowFocus,
    retry: queryConfigDefaults.dashboard.retry,
    retryDelay: queryConfigDefaults.dashboard.retryDelay,
  });
}

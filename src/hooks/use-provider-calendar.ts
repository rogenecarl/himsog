"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getCalendarAppointments,
  getDayAppointments,
} from "@/actions/provider/get-calendar-actions";
import { providerQueryKeys, queryConfigDefaults } from "@/lib/query-keys";

// Re-export query keys for backwards compatibility
export const calendarKeys = {
  all: ["provider-calendar"] as const,
  appointments: (filters: string) => [...calendarKeys.all, "appointments", filters] as const,
  day: (date: string) => [...calendarKeys.all, "day", date] as const,
};

/**
 * Hook to fetch calendar appointments for a date range
 * - Used by Week and Month views
 * - Refetches on window focus
 * - Retries with exponential backoff
 */
export function useCalendarAppointments(filters?: {
  startDate?: Date;
  endDate?: Date;
}) {

  return useQuery({
    queryKey: providerQueryKeys.calendar.appointments(filters || {}),
    queryFn: async () => {
      const result = await getCalendarAppointments(filters);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: queryConfigDefaults.calendar.staleTime,
    gcTime: queryConfigDefaults.calendar.gcTime,
    refetchOnWindowFocus: queryConfigDefaults.calendar.refetchOnWindowFocus,
    retry: queryConfigDefaults.calendar.retry,
    retryDelay: queryConfigDefaults.calendar.retryDelay,
  });
}

/**
 * Hook to fetch appointments for a specific day
 * - Used by Day view for detailed schedule
 * - Refetches on window focus
 */
export function useDayAppointments(date: Date) {
  const dateKey = date.toISOString();

  return useQuery({
    queryKey: providerQueryKeys.calendar.day(dateKey),
    queryFn: async () => {
      const result = await getDayAppointments(date);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: queryConfigDefaults.calendar.staleTime,
    gcTime: queryConfigDefaults.calendar.gcTime,
    refetchOnWindowFocus: queryConfigDefaults.calendar.refetchOnWindowFocus,
    retry: queryConfigDefaults.calendar.retry,
    retryDelay: queryConfigDefaults.calendar.retryDelay,
  });
}

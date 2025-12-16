"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getUpcomingAppointmentCount } from "@/actions/appointment/get-user-appointment-actions"

// Query key for upcoming appointment count
export const upcomingAppointmentKeys = {
  count: ["upcoming-appointments", "count"] as const,
}

/**
 * Lightweight hook to fetch upcoming appointment count for users
 * - Minimal payload (just a number)
 * - Counts PENDING and CONFIRMED appointments in the future
 * - Auto-refreshes every 60 seconds
 * - Refetches on window focus
 */
export function useUpcomingAppointmentCount() {
  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery({
    queryKey: upcomingAppointmentKeys.count,
    queryFn: async () => {
      const result = await getUpcomingAppointmentCount()
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch upcoming appointment count")
      }
      return result.data ?? 0
    },
    staleTime: 60000, // 60 seconds (appointments change less frequently)
    refetchInterval: 60000, // Poll every 60 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })

  // Function to manually invalidate and refetch
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: upcomingAppointmentKeys.count })
  }

  return {
    upcomingCount: data ?? 0,
    isLoading,
    refetch,
    invalidate,
  }
}

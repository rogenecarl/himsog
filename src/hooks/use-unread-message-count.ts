"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getUnreadCount } from "@/actions/messages/message-action"

// Query key for unread message count
export const unreadMessageKeys = {
  count: ["unread-messages", "count"] as const,
}

/**
 * Lightweight hook to fetch unread message count
 * - Minimal payload (just a number)
 * - Works for all user roles (USER and PROVIDER)
 * - Auto-refreshes every 30 seconds
 * - Refetches on window focus
 */
export function useUnreadMessageCount() {
  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery({
    queryKey: unreadMessageKeys.count,
    queryFn: async () => {
      const result = await getUnreadCount()
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch unread count")
      }
      return result.data ?? 0
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Poll every 30 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })

  // Function to manually invalidate and refetch
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: unreadMessageKeys.count })
  }

  return {
    unreadCount: data ?? 0,
    isLoading,
    refetch,
    invalidate,
  }
}

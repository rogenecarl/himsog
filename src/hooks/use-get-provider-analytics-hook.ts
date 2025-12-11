"use client";

import { useQuery } from "@tanstack/react-query";
import { getProviderAnalytics } from "@/actions/provider/get-provider-analytics-actions";
import { providerQueryKeys, queryConfigDefaults } from "@/lib/query-keys";

// Re-export query keys for backwards compatibility
export const analyticsKeys = {
  all: ["provider-analytics"] as const,
  data: (filters: string) => [...analyticsKeys.all, "data", filters] as const,
};

/**
 * Hook to fetch provider analytics
 * - Uses centralized query keys
 * - Refetches on window focus
 * - Retries with exponential backoff
 */
export function useProviderAnalytics(filters?: {
  startDate?: Date;
  endDate?: Date;
}) {
  return useQuery({
    queryKey: providerQueryKeys.analytics.data(filters || {}),
    queryFn: async () => {
      const result = await getProviderAnalytics(filters);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: queryConfigDefaults.analytics.staleTime,
    gcTime: queryConfigDefaults.analytics.gcTime,
    refetchOnWindowFocus: queryConfigDefaults.analytics.refetchOnWindowFocus,
    retry: queryConfigDefaults.analytics.retry,
    retryDelay: queryConfigDefaults.analytics.retryDelay,
  });
}

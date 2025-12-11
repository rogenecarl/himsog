"use client";

import { useQuery, useQueries } from "@tanstack/react-query";
import {
  getDashboardStats,
  getPendingActions,
  getGrowthChartData,
  getProviderStatusDistribution,
  getCategoryDistribution,
} from "@/actions/admin/dashboard-actions";
import { getRecentActivities } from "@/actions/admin/audit-actions";
import { queryConfigDefaults } from "@/lib/query-keys";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const dashboardKeys = {
  all: ["admin", "dashboard"] as const,
  stats: () => [...dashboardKeys.all, "stats"] as const,
  pending: () => [...dashboardKeys.all, "pending"] as const,
  growth: (days: number) => [...dashboardKeys.all, "growth", days] as const,
  providerStatus: () => [...dashboardKeys.all, "provider-status"] as const,
  categories: () => [...dashboardKeys.all, "categories"] as const,
  activities: (limit: number) =>
    [...dashboardKeys.all, "activities", limit] as const,
};

// ============================================================================
// OPTIMIZED: Combined hook that fetches ALL dashboard data in parallel
// ============================================================================

/**
 * Hook to fetch ALL dashboard data in parallel using useQueries
 * This eliminates waterfall loading and improves perceived performance
 */
export function useAdminDashboardData(options?: { days?: number; activityLimit?: number }) {
  const days = options?.days ?? 30;
  const activityLimit = options?.activityLimit ?? 10;

  const results = useQueries({
    queries: [
      {
        queryKey: dashboardKeys.stats(),
        queryFn: async () => {
          const result = await getDashboardStats();
          if (!result.success) throw new Error(result.error);
          return result.data;
        },
        ...queryConfigDefaults.dashboard,
      },
      {
        queryKey: dashboardKeys.pending(),
        queryFn: async () => {
          const result = await getPendingActions();
          if (!result.success) throw new Error(result.error);
          return result.data;
        },
        ...queryConfigDefaults.dashboard,
      },
      {
        queryKey: dashboardKeys.growth(days),
        queryFn: async () => {
          const result = await getGrowthChartData(days);
          if (!result.success) throw new Error(result.error);
          return result.data;
        },
        ...queryConfigDefaults.analytics,
      },
      {
        queryKey: dashboardKeys.providerStatus(),
        queryFn: async () => {
          const result = await getProviderStatusDistribution();
          if (!result.success) throw new Error(result.error);
          return result.data;
        },
        ...queryConfigDefaults.dashboard,
      },
      {
        queryKey: dashboardKeys.activities(activityLimit),
        queryFn: async () => {
          const result = await getRecentActivities(activityLimit);
          if (!result.success) throw new Error(result.error);
          return result.data;
        },
        ...queryConfigDefaults.dashboard,
      },
    ],
  });

  // Destructure results for easier access
  const [statsQuery, pendingQuery, growthQuery, statusQuery, activitiesQuery] = results;

  return {
    // Individual data
    stats: statsQuery.data,
    pending: pendingQuery.data,
    growth: growthQuery.data,
    statusDistribution: statusQuery.data,
    activities: activitiesQuery.data,
    // Loading states
    isLoading: results.some((r) => r.isLoading),
    isStatsLoading: statsQuery.isLoading,
    isPendingLoading: pendingQuery.isLoading,
    isGrowthLoading: growthQuery.isLoading,
    isStatusLoading: statusQuery.isLoading,
    isActivitiesLoading: activitiesQuery.isLoading,
    // Error states
    hasError: results.some((r) => r.isError),
    errors: results.filter((r) => r.error).map((r) => r.error),
  };
}

// ============================================================================
// INDIVIDUAL HOOKS (kept for backward compatibility)
// ============================================================================

/**
 * Hook to fetch dashboard statistics
 * OPTIMIZED: Uses queryConfigDefaults
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: async () => {
      const result = await getDashboardStats();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    ...queryConfigDefaults.dashboard,
  });
}

/**
 * Hook to fetch pending actions count
 */
export function usePendingActions() {
  return useQuery({
    queryKey: dashboardKeys.pending(),
    queryFn: async () => {
      const result = await getPendingActions();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    ...queryConfigDefaults.dashboard,
  });
}

/**
 * Hook to fetch growth chart data
 */
export function useGrowthChart(days = 30) {
  return useQuery({
    queryKey: dashboardKeys.growth(days),
    queryFn: async () => {
      const result = await getGrowthChartData(days);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    ...queryConfigDefaults.analytics,
  });
}

/**
 * Hook to fetch provider status distribution for pie chart
 */
export function useProviderStatusDistribution() {
  return useQuery({
    queryKey: dashboardKeys.providerStatus(),
    queryFn: async () => {
      const result = await getProviderStatusDistribution();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    ...queryConfigDefaults.dashboard,
  });
}

/**
 * Hook to fetch category distribution
 */
export function useCategoryDistribution() {
  return useQuery({
    queryKey: dashboardKeys.categories(),
    queryFn: async () => {
      const result = await getCategoryDistribution();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    ...queryConfigDefaults.static,
  });
}

/**
 * Hook to fetch recent admin activities
 */
export function useRecentActivities(limit = 10) {
  return useQuery({
    queryKey: dashboardKeys.activities(limit),
    queryFn: async () => {
      const result = await getRecentActivities(limit);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    ...queryConfigDefaults.dashboard,
  });
}

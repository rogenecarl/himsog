import { useQuery } from "@tanstack/react-query";
import {
  getAdminDashboardAnalytics,
  type DateRange,
} from "@/actions/admin/analytics-actions";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const analyticsKeys = {
  all: ["admin", "analytics"] as const,
  dashboard: (dateRange: DateRange) =>
    [...analyticsKeys.all, "dashboard", dateRange] as const,
};

// ============================================================================
// DASHBOARD ANALYTICS
// ============================================================================

export function useAdminDashboardAnalytics(dateRange: DateRange) {
  return useQuery({
    queryKey: analyticsKeys.dashboard(dateRange),
    queryFn: async () => {
      const result = await getAdminDashboardAnalytics(dateRange);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 60000, // 1 minute
    enabled: !!dateRange.from && !!dateRange.to,
  });
}

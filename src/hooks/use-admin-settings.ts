import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPlatformSettings,
  updatePlatformSettings,
  getAdminUsers,
  getSystemStats,
  getAuditLogStats,
  type PlatformSettings,
} from "@/actions/admin/settings-actions";
import {
  getAuditLogs,
  type AuditLogQueryParams,
} from "@/actions/admin/audit-actions";
import { toast } from "sonner";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const settingsKeys = {
  all: ["admin", "settings"] as const,
  platform: () => [...settingsKeys.all, "platform"] as const,
  admins: () => [...settingsKeys.all, "admins"] as const,
  systemStats: () => [...settingsKeys.all, "system-stats"] as const,
  auditStats: () => [...settingsKeys.all, "audit-stats"] as const,
  auditLogs: (params: AuditLogQueryParams) =>
    [...settingsKeys.all, "audit-logs", params] as const,
};

// ============================================================================
// PLATFORM SETTINGS HOOKS
// ============================================================================

export function usePlatformSettings() {
  return useQuery({
    queryKey: settingsKeys.platform(),
    queryFn: async () => {
      const result = await getPlatformSettings();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 60000, // 1 minute
  });
}

export function useUpdatePlatformSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<PlatformSettings>) => {
      const result = await updatePlatformSettings(settings);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.platform() });
      toast.success("Settings updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update settings");
    },
  });
}

// ============================================================================
// ADMIN USERS HOOK
// ============================================================================

export function useAdminUsers() {
  return useQuery({
    queryKey: settingsKeys.admins(),
    queryFn: async () => {
      const result = await getAdminUsers();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 60000,
  });
}

// ============================================================================
// SYSTEM STATS HOOK
// ============================================================================

export function useSystemStats() {
  return useQuery({
    queryKey: settingsKeys.systemStats(),
    queryFn: async () => {
      const result = await getSystemStats();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refresh every minute
  });
}

// ============================================================================
// AUDIT LOG HOOKS
// ============================================================================

export function useAuditLogStats() {
  return useQuery({
    queryKey: settingsKeys.auditStats(),
    queryFn: async () => {
      const result = await getAuditLogStats();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 60000,
  });
}

export function useAuditLogs(params: AuditLogQueryParams = {}) {
  return useQuery({
    queryKey: settingsKeys.auditLogs(params),
    queryFn: async () => {
      const result = await getAuditLogs(params);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 30000,
  });
}

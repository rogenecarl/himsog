"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getProviderAppointments,
  getAppointmentStatistics,
  updateAppointmentStatus,
  cancelAppointment,
} from "@/actions/provider/get-provider-appointments-actions";
import {
  bulkUpdateAppointmentStatus,
  rescheduleAppointment,
} from "@/actions/provider/bulk-appointment-actions";
import type { AppointmentStatus } from "@/lib/generated/prisma";
import { providerQueryKeys, queryConfigDefaults } from "@/lib/query-keys";

// Appointment type for optimistic updates
interface AppointmentData {
  id: string;
  status: AppointmentStatus;
  [key: string]: unknown;
}

// Re-export query keys for backwards compatibility
export const appointmentKeys = {
  all: ["provider-appointments"] as const,
  lists: () => [...appointmentKeys.all, "list"] as const,
  list: (filters: string) => [...appointmentKeys.lists(), { filters }] as const,
  statistics: () => [...appointmentKeys.all, "statistics"] as const,
  stats: (filters: string) =>
    [...appointmentKeys.statistics(), { filters }] as const,
};

/**
 * Hook to fetch provider appointments
 * - Uses centralized query keys
 * - Refetches on window focus
 * - Retries with exponential backoff
 */
export function useProviderAppointments(filters?: {
  startDate?: Date;
  endDate?: Date;
  status?: AppointmentStatus;
}) {
  return useQuery({
    queryKey: providerQueryKeys.appointments.list(filters || {}),
    queryFn: async () => {
      const result = await getProviderAppointments(filters);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: queryConfigDefaults.appointments.staleTime,
    gcTime: queryConfigDefaults.appointments.gcTime,
    refetchOnWindowFocus: queryConfigDefaults.appointments.refetchOnWindowFocus,
    retry: queryConfigDefaults.appointments.retry,
    retryDelay: queryConfigDefaults.appointments.retryDelay,
  });
}

/**
 * Hook to fetch appointment statistics
 * - Uses centralized query keys
 * - Refetches on window focus
 */
export function useAppointmentStatistics(filters?: {
  startDate?: Date;
  endDate?: Date;
}) {
  return useQuery({
    queryKey: providerQueryKeys.appointments.stats(filters || {}),
    queryFn: async () => {
      const result = await getAppointmentStatistics(filters);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: queryConfigDefaults.appointments.staleTime,
    gcTime: queryConfigDefaults.appointments.gcTime,
    refetchOnWindowFocus: queryConfigDefaults.appointments.refetchOnWindowFocus,
    retry: queryConfigDefaults.appointments.retry,
    retryDelay: queryConfigDefaults.appointments.retryDelay,
  });
}

// Update appointment status mutation - waits for server response before updating UI
export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      status,
      activityNotes,
    }: {
      appointmentId: string;
      status: AppointmentStatus;
      activityNotes?: string;
    }) => {
      const result = await updateAppointmentStatus(appointmentId, status, activityNotes);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },

    // Show error toast on failure
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update appointment status");
    },

    // Show success toast and refetch data
    onSuccess: (_data, variables) => {
      const statusMessages: Record<AppointmentStatus, string> = {
        PENDING: "Appointment set to pending",
        CONFIRMED: "Appointment confirmed successfully",
        COMPLETED: "Appointment marked as completed",
        CANCELLED: "Appointment cancelled",
        NO_SHOW: "Appointment marked as no-show",
      };
      toast.success(statusMessages[variables.status]);
    },

    // Refetch after error or success to sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.appointments.all() });
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.dashboard.all() });
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.calendar.all() });
    },
  });
}

// Cancel appointment mutation with optimistic updates
export function useCancelAppointment() {
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
      // Combine reason and notes for the cancellation reason
      const fullReason = notes ? `${reason}: ${notes}` : reason;
      const result = await cancelAppointment(appointmentId, fullReason);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },

    // Optimistic update
    onMutate: async ({ appointmentId }) => {
      await queryClient.cancelQueries({ queryKey: appointmentKeys.all });

      const previousData = queryClient.getQueriesData({
        queryKey: appointmentKeys.lists(),
      });

      queryClient.setQueriesData(
        { queryKey: appointmentKeys.lists() },
        (old: AppointmentData[] | undefined) => {
          if (!old || !Array.isArray(old)) return old;
          return old.map((apt) =>
            apt.id === appointmentId
              ? { ...apt, status: "CANCELLED" as AppointmentStatus }
              : apt
          );
        }
      );

      return { previousData };
    },

    onError: (error: Error, _variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(error.message || "Failed to cancel appointment");
    },

    onSuccess: () => {
      toast.success("Appointment cancelled successfully");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.appointments.all() });
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.dashboard.all() });
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.calendar.all() });
    },
  });
}

// Bulk update appointment status mutation
export function useBulkUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentIds,
      status,
      reason,
    }: {
      appointmentIds: string[];
      status: AppointmentStatus;
      reason?: string;
    }) => {
      const result = await bulkUpdateAppointmentStatus(
        appointmentIds,
        status,
        reason
      );
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },

    // Optimistic update for bulk operations
    onMutate: async ({ appointmentIds, status }) => {
      await queryClient.cancelQueries({ queryKey: appointmentKeys.all });

      const previousData = queryClient.getQueriesData({
        queryKey: appointmentKeys.lists(),
      });

      queryClient.setQueriesData(
        { queryKey: appointmentKeys.lists() },
        (old: AppointmentData[] | undefined) => {
          if (!old || !Array.isArray(old)) return old;
          return old.map((apt) =>
            appointmentIds.includes(apt.id) ? { ...apt, status } : apt
          );
        }
      );

      return { previousData };
    },

    onError: (error: Error, _variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(error.message || "Failed to update appointments");
    },

    onSuccess: (data, variables) => {
      const statusMessages: Record<AppointmentStatus, string> = {
        PENDING: "set to pending",
        CONFIRMED: "confirmed",
        COMPLETED: "marked as completed",
        CANCELLED: "cancelled",
        NO_SHOW: "marked as no-show",
      };

      if (data) {
        const message = `${data.success} appointment${data.success > 1 ? "s" : ""} ${statusMessages[variables.status]}`;
        if (data.failed > 0) {
          toast.warning(
            `${message}. ${data.failed} failed: ${data.errors.join(", ")}`
          );
        } else {
          toast.success(message);
        }
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.appointments.all() });
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.dashboard.all() });
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.calendar.all() });
    },
  });
}

// Reschedule appointment mutation
export function useRescheduleAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      newStartTime,
      newEndTime,
    }: {
      appointmentId: string;
      newStartTime: Date;
      newEndTime: Date;
    }) => {
      const result = await rescheduleAppointment(
        appointmentId,
        newStartTime,
        newEndTime
      );
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },

    onSuccess: () => {
      toast.success("Appointment rescheduled successfully");
    },

    onError: (error: Error) => {
      toast.error(error.message || "Failed to reschedule appointment");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.appointments.all() });
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.calendar.all() });
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.dashboard.all() });
    },
  });
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAllProviders,
  getProviderById,
  updateProviderStatus,
  updateDocumentStatus,
  type ProviderQueryParams,
} from "@/actions/admin/update-provider-actions";
import type { ProviderStatus } from "@/lib/generated/prisma";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const providerKeys = {
  all: ["admin-providers"] as const,
  lists: () => [...providerKeys.all, "list"] as const,
  list: (params: ProviderQueryParams) => [...providerKeys.lists(), params] as const,
  details: () => [...providerKeys.all, "detail"] as const,
  detail: (id: string) => [...providerKeys.details(), id] as const,
};

// ============================================================================
// GET ALL PROVIDERS (with server-side pagination)
// ============================================================================

export function useAdminProviders(params: ProviderQueryParams = {}) {
  return useQuery({
    queryKey: providerKeys.list(params),
    queryFn: async () => {
      const result = await getAllProviders(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 30000, // 30 seconds
  });
}

// ============================================================================
// GET PROVIDER BY ID
// ============================================================================

export function useAdminProvider(id: string) {
  return useQuery({
    queryKey: providerKeys.detail(id),
    queryFn: async () => {
      const result = await getProviderById(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!id,
  });
}

// ============================================================================
// UPDATE PROVIDER STATUS
// ============================================================================

export function useUpdateProviderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      providerId,
      status,
      reason,
      sendNotification = true,
    }: {
      providerId: string;
      status: ProviderStatus;
      reason?: string;
      sendNotification?: boolean;
    }) => {
      const result = await updateProviderStatus(
        providerId,
        status,
        reason,
        sendNotification
      );
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update provider status");
    },
    onSuccess: () => {
      toast.success("Provider status updated successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: providerKeys.all });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}

// ============================================================================
// UPDATE DOCUMENT STATUS
// ============================================================================

export function useUpdateDocumentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      documentId,
      verificationStatus,
      reason,
    }: {
      documentId: string;
      verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
      reason?: string;
    }) => {
      const result = await updateDocumentStatus(documentId, verificationStatus, reason);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update document status");
    },
    onSuccess: (_, variables) => {
      toast.success(`Document ${variables.verificationStatus.toLowerCase()} successfully`);
    },
    onSettled: () => {
      // Invalidate all provider queries including details to refresh document status
      queryClient.invalidateQueries({ queryKey: providerKeys.all });
    },
  });
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createService,
  updateService,
  deleteService,
  toggleServiceActive,
  getProviderServices,
  removeChildServiceFromPackage,
} from "@/actions/provider/provider-services-action";
import { toast } from "sonner";
import { providerQueryKeys, queryConfigDefaults } from "@/lib/query-keys";

/**
 * Hook to fetch provider services
 * - Uses centralized query keys
 * - Refetches on window focus
 * - Retries with exponential backoff
 */
export function useProviderServices() {
  return useQuery({
    queryKey: providerQueryKeys.services.all(),
    queryFn: async () => {
      const result = await getProviderServices();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch services");
      }
      return result.data;
    },
    staleTime: queryConfigDefaults.services.staleTime,
    gcTime: queryConfigDefaults.services.gcTime,
    refetchOnWindowFocus: queryConfigDefaults.services.refetchOnWindowFocus,
    retry: queryConfigDefaults.services.retry,
    retryDelay: queryConfigDefaults.services.retryDelay,
  });
}

// Hook to create a service
export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      type: 'SINGLE' | 'PACKAGE';
      pricingModel: 'FIXED' | 'RANGE';
      fixedPrice?: number;
      priceMin?: number;
      priceMax?: number;
      acceptedInsurances?: string[];
      includedServices?: string[];
      isActive?: boolean;
      sortOrder?: number;
    }) => {
      const result = await createService(data);
      if (!result.success) {
        throw new Error(result.error || "Failed to create service");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.services.all() });
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.profile.all() });
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.dashboard.stats() });
      toast.success("Service created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create service");
    },
  });
}

// Hook to update a service
export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serviceId,
      data,
    }: {
      serviceId: string;
      data: {
        name?: string;
        description?: string;
        type?: 'SINGLE' | 'PACKAGE';
        pricingModel?: 'FIXED' | 'RANGE';
        fixedPrice?: number;
        priceMin?: number;
        priceMax?: number;
        acceptedInsurances?: string[];
        includedServices?: string[];
        isActive?: boolean;
        sortOrder?: number;
      };
    }) => {
      const result = await updateService(serviceId, data);
      if (!result.success) {
        throw new Error(result.error || "Failed to update service");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.services.all() });
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.profile.all() });
      toast.success("Service updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update service");
    },
  });
}

// Hook to delete a service
export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceId: string) => {
      const result = await deleteService(serviceId);
      if (!result.success) {
        throw new Error(result.error || "Failed to delete service");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.services.all() });
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.profile.all() });
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.dashboard.stats() });
      toast.success("Service deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete service");
    },
  });
}

// Hook to toggle service active status
export function useToggleServiceActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serviceId,
      isActive,
    }: {
      serviceId: string;
      isActive: boolean;
    }) => {
      const result = await toggleServiceActive(serviceId, isActive);
      if (!result.success) {
        throw new Error(result.error || "Failed to update service status");
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.services.all() });
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.profile.all() });
      toast.success(
        `Service ${variables.isActive ? "activated" : "deactivated"} successfully`
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update service status");
    },
  });
}

// Hook to remove child service from package
export function useRemoveChildService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      packageId,
      childServiceName,
    }: {
      packageId: string;
      childServiceName: string;
    }) => {
      const result = await removeChildServiceFromPackage(packageId, childServiceName);
      if (!result.success) {
        throw new Error(result.error || "Failed to remove service from package");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.services.all() });
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.profile.all() });
      toast.success("Service removed from package successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove service from package");
    },
  });
}

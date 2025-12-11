"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProviderBasicInfo } from "@/actions/provider/update-provider-profile-action";
import { updateProviderOperatingHours } from "@/actions/provider/update-provider-profile-action";
import { updateProviderCoverPhoto } from "@/actions/provider/update-provider-profile-action";
import { toast } from "sonner";

// Hook to update provider basic information
export function useUpdateProviderBasicInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      healthcareName?: string;
      description?: string;
      phoneNumber?: string;
      email?: string;
      address?: string;
      city?: string;
      province?: string;
      latitude?: number;
      longitude?: number;
    }) => {
      const result = await updateProviderBasicInfo(data);
      if (!result.success) {
        throw new Error(result.error || "Failed to update provider information");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providerProfile"] });
      toast.success("Provider information updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update provider information");
    },
  });
}

// Hook to update provider operating hours
export function useUpdateProviderOperatingHours() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      operatingHours: Array<{
        dayOfWeek: number;
        startTime?: string;
        endTime?: string;
        isClosed: boolean;
      }>;
    }) => {
      const result = await updateProviderOperatingHours(data);
      if (!result.success) {
        throw new Error(result.error || "Failed to update operating hours");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providerProfile"] });
      toast.success("Operating hours updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update operating hours");
    },
  });
}

// Hook to update provider cover photo
export function useUpdateProviderCoverPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await updateProviderCoverPhoto(formData);
      if (!result.success) {
        throw new Error(result.error || "Failed to update cover photo");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providerProfile"] });
      toast.success("Cover photo updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update cover photo");
    },
  });
}

"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAllProviders,
  getProviderProfile,
} from "@/actions/provider/create-provider-profile-actions";

// Query keys
export const providerKeys = {
  all: ["provider"] as const,
  profile: () => [...providerKeys.all, "profile"] as const,
  details: () => [...providerKeys.all, "details"] as const,
};

// Get provider profile hook
export function useProviderProfile() {
  return useQuery({
    queryKey: providerKeys.profile(),
    queryFn: async () => {
      const result = await getProviderProfile();
      if (!result.success) {
        // If the error is "Provider profile not found", return null instead of throwing
        if (result.error === "Provider profile not found") {
          return null;
        }
        throw new Error(result.error);
      }
      return result.data;
    },
    retry: false, // Don't retry if user doesn't have a profile
  });
}

// Get all verified providers hook
export function useAllProviders() {
  return useQuery({
    queryKey: [...providerKeys.all, "verified"],
    queryFn: async () => {
      const result = await getAllProviders();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Check if user has provider profile
export function useHasProviderProfile() {
  const { data: provider, isLoading, error } = useProviderProfile();

  return {
    hasProfile: provider !== null && provider !== undefined,
    isLoading,
    error,
    provider,
  };
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    createProviderProfile,
    getAllProviders,
    getFilteredProviders,
    getProviderProfile,
    getProviderById,
} from "@/actions/provider/create-provider-profile-actions";
import { queryConfigDefaults } from "@/lib/query-keys";

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

// Create provider profile mutation
export function useCreateProviderProfile() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            const result = await createProviderProfile(formData);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: providerKeys.all });
            toast.success(
                "Provider profile created successfully! Your profile is pending verification."
            );

            // Redirect to dashboard or success page
            router.push("/provider/dashboard");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to create provider profile");
        },
    });
}

// Get all verified providers hook (for backward compatibility)
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
        ...queryConfigDefaults.static, // Use static config (30min stale, 1hr cache)
    });
}

// Get filtered providers with server-side pagination - OPTIMIZED for browse-services
export function useFilteredProviders(filters?: {
    search?: string;
    categorySlug?: string;
    page?: number;
    limit?: number;
}) {
    return useQuery({
        queryKey: [...providerKeys.all, "filtered", filters?.search, filters?.categorySlug, filters?.page],
        queryFn: async () => {
            const result = await getFilteredProviders(filters);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result;
        },
        ...queryConfigDefaults.services, // Use services config (5min stale)
        // Keep previous data while loading new page for smooth UX
        placeholderData: (previousData) => previousData,
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

// Get a single provider by ID - OPTIMIZED for set-appointment page
// Uses targeted fetch instead of loading ALL providers
export function useProviderById(providerId: string) {
    return useQuery({
        queryKey: [...providerKeys.all, "single", providerId],
        queryFn: async () => {
            const result = await getProviderById(providerId);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
        enabled: !!providerId,
        ...queryConfigDefaults.static, // Provider data rarely changes
    });
}

"use client";

import { useQuery } from "@tanstack/react-query";
import {
    getProviderAvailableSlots,
    getProviderOperatingDays,
    isValidBookingDate
} from "@/actions/provider/provider-date-time-slots-actions";
import { format } from "date-fns";

// Query keys for better cache management
export const dateTimeSlotsKeys = {
    all: ["dateTimeSlots"] as const,
    provider: (providerId: string) => [...dateTimeSlotsKeys.all, "provider", providerId] as const,
    availableSlots: (providerId: string, date: Date) =>
        [...dateTimeSlotsKeys.provider(providerId), "slots", format(date, "yyyy-MM-dd")] as const,
    operatingDays: (providerId: string) =>
        [...dateTimeSlotsKeys.provider(providerId), "operatingDays"] as const,
    validDate: (providerId: string, date: Date) =>
        [...dateTimeSlotsKeys.provider(providerId), "validDate", format(date, "yyyy-MM-dd")] as const,
};

// Hook to get available time slots for a specific date
export function useProviderAvailableSlots(providerId: string, date: Date | null) {
    return useQuery({
        queryKey: date ? dateTimeSlotsKeys.availableSlots(providerId, date) : [],
        queryFn: () => {
            if (!date) throw new Error("Date is required");
            const dateString = format(date, "yyyy-MM-dd");
            return getProviderAvailableSlots(providerId, dateString);
        },
        enabled: !!providerId && !!date,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        refetchOnWindowFocus: true, // Refetch when user comes back to tab
        refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes to keep slots updated
    });
}

// Hook to get provider's operating days
export function useProviderOperatingDays(providerId: string) {
    return useQuery({
        queryKey: dateTimeSlotsKeys.operatingDays(providerId),
        queryFn: () => getProviderOperatingDays(providerId),
        enabled: !!providerId,
        staleTime: 1000 * 60 * 30, // 30 minutes (operating days don't change often)
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

// Hook to check if a date is valid for booking
export function useIsValidBookingDate(providerId: string, date: Date | null) {
    return useQuery({
        queryKey: date ? dateTimeSlotsKeys.validDate(providerId, date) : [],
        queryFn: () => {
            if (!date) throw new Error("Date is required");
            const dateString = format(date, "yyyy-MM-dd");
            return isValidBookingDate(providerId, dateString);
        },
        enabled: !!providerId && !!date,
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
    });
}

// Helper hook to get multiple dates validation at once (useful for calendar rendering)
export function useValidBookingDates(providerId: string, dates: Date[]) {
    return useQuery({
        queryKey: [...dateTimeSlotsKeys.provider(providerId), "validDates", dates.map(d => format(d, "yyyy-MM-dd"))],
        queryFn: async () => {
            const results = await Promise.all(
                dates.map(async (date) => ({
                    date,
                    isValid: await isValidBookingDate(providerId, format(date, "yyyy-MM-dd")),
                }))
            );
            return results;
        },
        enabled: !!providerId && dates.length > 0,
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
    });
}
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUserAppointment, checkAppointmentAvailability } from "@/actions/appointment/create-user-appointment-actions";
import { CreateUserAppointmentFormType } from "@/schemas/create-user-appointment.schema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { dateTimeSlotsKeys } from "./use-date-time-slots";

// Query keys for appointment-related queries
export const appointmentKeys = {
  all: ["appointments"] as const,
  user: (userId: string) => [...appointmentKeys.all, "user", userId] as const,
  provider: (providerId: string) => [...appointmentKeys.all, "provider", providerId] as const,
  availability: (providerId: string, date: Date, time: string) =>
    [...appointmentKeys.all, "availability", providerId, date.toISOString(), time] as const,
};

// Hook to create a new appointment
export function useCreateUserAppointment() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: CreateUserAppointmentFormType) => {
      const result = await createUserAppointment(data);

      if (!result.success) {
        throw new Error(result.error || "Failed to create appointment");
      }

      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      queryClient.invalidateQueries({
        queryKey: dateTimeSlotsKeys.provider(variables.providerId)
      });

      // Show success message
      toast.success("Appointment Confirmed!", {
        description: `Your appointment has been scheduled for ${variables.selectedDate?.toLocaleDateString() || 'selected date'} at ${variables.selectedTime}`,
        duration: 5000,
      });

      // Navigate to success page or appointments list
      // router.push(`/appointments/${data.data?.appointmentId}?success=true`);
      router.push(`/appointments`);
    },
    onError: (error) => {
      console.error("Failed to create appointment:", error);

      toast.error("Booking Failed", {
        description: error instanceof Error ? error.message : "Failed to create appointment. Please try again.",
        duration: 5000,
      });
    },
  });
}

// Hook to check appointment availability
export function useCheckAppointmentAvailability() {
  return useMutation({
    mutationFn: async ({
      providerId,
      date,
      time
    }: {
      providerId: string;
      date: Date;
      time: string;
    }) => {
      return await checkAppointmentAvailability(providerId, date, time);
    },
    onError: (error) => {
      console.error("Failed to check availability:", error);
      toast.error("Availability Check Failed", {
        description: "Could not verify time slot availability. Please try again.",
      });
    },
  });
}
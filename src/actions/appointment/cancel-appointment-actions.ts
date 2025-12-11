"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  USER_CANCELLATION_REASONS,
  PROVIDER_CANCELLATION_REASONS,
} from "@/lib/constants/cancellation-reasons";

interface CancelAppointmentParams {
  appointmentId: string;
  reason: string;
  notes?: string;
}

// Cancel appointment by user
export async function cancelAppointmentByUser({ appointmentId, reason, notes }: CancelAppointmentParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in to cancel an appointment",
      };
    }

    // Verify the appointment belongs to the user
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { userId: true, status: true },
    });

    if (!appointment) {
      return {
        success: false,
        error: "Appointment not found",
      };
    }

    if (appointment.userId !== session.user.id) {
      return {
        success: false,
        error: "You can only cancel your own appointments",
      };
    }

    if (appointment.status === "CANCELLED") {
      return {
        success: false,
        error: "This appointment is already cancelled",
      };
    }

    if (appointment.status === "COMPLETED") {
      return {
        success: false,
        error: "Cannot cancel a completed appointment",
      };
    }

    // Build the cancellation reason text
    const reasonLabel = USER_CANCELLATION_REASONS.find(r => r.value === reason)?.label || reason;
    const cancellationReason = notes ? `${reasonLabel}: ${notes}` : reasonLabel;

    // Update the appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancellationReason,
        cancelledBy: session.user.id,
      },
    });

    return {
      success: true,
      data: updatedAppointment,
    };
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel appointment",
    };
  }
}

// Cancel appointment by provider
export async function cancelAppointmentByProvider({ appointmentId, reason, notes }: CancelAppointmentParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in to cancel an appointment",
      };
    }

    // Verify the user is a provider and owns this appointment
    const provider = await prisma.provider.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!provider) {
      return {
        success: false,
        error: "Provider profile not found",
      };
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { providerId: true, status: true },
    });

    if (!appointment) {
      return {
        success: false,
        error: "Appointment not found",
      };
    }

    if (appointment.providerId !== provider.id) {
      return {
        success: false,
        error: "You can only cancel appointments for your practice",
      };
    }

    if (appointment.status === "CANCELLED") {
      return {
        success: false,
        error: "This appointment is already cancelled",
      };
    }

    if (appointment.status === "COMPLETED") {
      return {
        success: false,
        error: "Cannot cancel a completed appointment",
      };
    }

    // Build the cancellation reason text
    const reasonLabel = PROVIDER_CANCELLATION_REASONS.find(r => r.value === reason)?.label || reason;
    const cancellationReason = notes ? `${reasonLabel}: ${notes}` : reasonLabel;

    // Update the appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancellationReason,
        cancelledBy: session.user.id,
      },
    });

    return {
      success: true,
      data: updatedAppointment,
    };
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel appointment",
    };
  }
}

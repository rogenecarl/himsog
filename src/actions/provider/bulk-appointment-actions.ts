"use server";

import prisma from "@/lib/prisma";
import { requireProvider } from "@/actions/auth/auth-check-utils";
import { AppointmentStatus } from "@/lib/generated/prisma";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";

interface BulkUpdateResult {
  success: number;
  failed: number;
  errors: string[];
}

/**
 * Bulk update appointment status
 * Updates multiple appointments at once with the same status
 */
export async function bulkUpdateAppointmentStatus(
  appointmentIds: string[],
  status: AppointmentStatus,
  reason?: string
): Promise<{ success: boolean; data?: BulkUpdateResult; error?: string }> {
  const user = await requireProvider();

  try {
    const provider = await prisma.provider.findUnique({
      where: { userId: user.id },
      select: { id: true, healthcareName: true },
    });

    if (!provider) {
      return { success: false, error: "Provider profile not found" };
    }

    if (appointmentIds.length === 0) {
      return { success: false, error: "No appointments selected" };
    }

    // Verify all appointments belong to this provider
    const appointments = await prisma.appointment.findMany({
      where: {
        id: { in: appointmentIds },
        providerId: provider.id,
      },
      select: {
        id: true,
        userId: true,
        startTime: true,
        status: true,
      },
    });

    if (appointments.length === 0) {
      return { success: false, error: "No valid appointments found" };
    }

    const validIds = appointments.map((a) => a.id);
    const invalidCount = appointmentIds.length - validIds.length;

    // Update appointments in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update all appointments
      const updateResult = await tx.appointment.updateMany({
        where: {
          id: { in: validIds },
          providerId: provider.id,
        },
        data: {
          status,
          ...(status === "CANCELLED"
            ? {
                cancelledAt: new Date(),
                cancellationReason: reason || "Cancelled by provider",
                cancelledBy: user.id,
              }
            : {}),
        },
      });

      // Create notifications for each appointment
      const notificationData = appointments.map((apt) => ({
        userId: apt.userId,
        type: getNotificationType(status),
        title: getNotificationTitle(status),
        message: getNotificationMessage(
          status,
          provider.healthcareName,
          apt.startTime,
          reason
        ),
        appointmentId: apt.id,
        providerId: provider.id,
      }));

      await tx.notification.createMany({
        data: notificationData,
      });

      return updateResult;
    });

    revalidatePath("/provider/appointments");
    revalidatePath("/provider/dashboard");

    return {
      success: true,
      data: {
        success: result.count,
        failed: invalidCount,
        errors:
          invalidCount > 0
            ? [`${invalidCount} appointment(s) were not found or unauthorized`]
            : [],
      },
    };
  } catch (error) {
    console.error("Failed to bulk update appointments:", error);
    return { success: false, error: "Failed to update appointments" };
  }
}

/**
 * Reschedule an appointment to a new date/time
 */
export async function rescheduleAppointment(
  appointmentId: string,
  newStartTime: Date,
  newEndTime: Date
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const user = await requireProvider();

  try {
    const provider = await prisma.provider.findUnique({
      where: { userId: user.id },
      select: { id: true, healthcareName: true },
    });

    if (!provider) {
      return { success: false, error: "Provider profile not found" };
    }

    // Verify appointment belongs to provider
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        providerId: provider.id,
      },
      select: {
        id: true,
        userId: true,
        startTime: true,
        status: true,
      },
    });

    if (!appointment) {
      return { success: false, error: "Appointment not found" };
    }

    // Check for conflicts
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        providerId: provider.id,
        id: { not: appointmentId },
        status: { in: ["PENDING", "CONFIRMED"] },
        OR: [
          {
            // New appointment starts during an existing one
            startTime: { lte: newStartTime },
            endTime: { gt: newStartTime },
          },
          {
            // New appointment ends during an existing one
            startTime: { lt: newEndTime },
            endTime: { gte: newEndTime },
          },
          {
            // New appointment encompasses an existing one
            startTime: { gte: newStartTime },
            endTime: { lte: newEndTime },
          },
        ],
      },
    });

    if (conflictingAppointment) {
      return {
        success: false,
        error: "There is a scheduling conflict with another appointment",
      };
    }

    // Update appointment and create notification
    const updated = await prisma.$transaction(async (tx) => {
      const updatedAppointment = await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          startTime: newStartTime,
          endTime: newEndTime,
        },
      });

      await tx.notification.create({
        data: {
          userId: appointment.userId,
          type: "APPOINTMENT_CONFIRMED",
          title: "Appointment Rescheduled",
          message: `Your appointment at ${provider.healthcareName} has been rescheduled to ${format(newStartTime, "MMM dd, yyyy 'at' h:mm a")}`,
          appointmentId: appointment.id,
          providerId: provider.id,
        },
      });

      return updatedAppointment;
    });

    revalidatePath("/provider/appointments");
    revalidatePath("/provider/calendar");

    return {
      success: true,
      data: {
        ...updated,
        totalPrice: Number(updated.totalPrice),
      },
    };
  } catch (error) {
    console.error("Failed to reschedule appointment:", error);
    return { success: false, error: "Failed to reschedule appointment" };
  }
}

// Helper functions
function getNotificationType(
  status: AppointmentStatus
): "APPOINTMENT_CONFIRMED" | "APPOINTMENT_CANCELLED" {
  if (status === "CANCELLED") return "APPOINTMENT_CANCELLED";
  return "APPOINTMENT_CONFIRMED";
}

function getNotificationTitle(status: AppointmentStatus): string {
  const titles: Record<AppointmentStatus, string> = {
    PENDING: "Appointment Status Updated",
    CONFIRMED: "Appointment Confirmed",
    COMPLETED: "Appointment Completed",
    CANCELLED: "Appointment Cancelled",
    NO_SHOW: "Appointment Marked as No-Show",
  };
  return titles[status];
}

function getNotificationMessage(
  status: AppointmentStatus,
  providerName: string,
  appointmentDate: Date,
  reason?: string
): string {
  const dateStr = format(appointmentDate, "MMM dd, yyyy 'at' h:mm a");

  const messages: Record<AppointmentStatus, string> = {
    PENDING: `Your appointment at ${providerName} on ${dateStr} status has been updated to pending.`,
    CONFIRMED: `Your appointment at ${providerName} on ${dateStr} has been confirmed!`,
    COMPLETED: `Your appointment at ${providerName} has been marked as completed. Thank you!`,
    CANCELLED: `Your appointment at ${providerName} on ${dateStr} has been cancelled.${reason ? ` Reason: ${reason}` : ""}`,
    NO_SHOW: `Your appointment at ${providerName} on ${dateStr} has been marked as a no-show.`,
  };
  return messages[status];
}

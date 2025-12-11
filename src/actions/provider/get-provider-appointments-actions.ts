"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { AppointmentStatus, Prisma } from "@/lib/generated/prisma";
import { format } from "date-fns";

// Get provider's appointments with filters
export async function getProviderAppointments(filters?: {
  startDate?: Date;
  endDate?: Date;
  status?: AppointmentStatus;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in",
      };
    }

    // Get provider profile
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

    // Fetch all PENDING and CONFIRMED appointments (always show)
    const pendingConfirmedAppointments = await prisma.appointment.findMany({
      where: {
        providerId: provider.id,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        services: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                description: true,
                priceMin: true,
                priceMax: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    // Fetch COMPLETED and CANCELLED appointments with date filter
    const completedCancelledWhere: Prisma.AppointmentWhereInput = {
      providerId: provider.id,
      status: {
        in: ["COMPLETED", "CANCELLED"],
      },
    };

    // Apply date filter for completed/cancelled
    if (filters?.startDate || filters?.endDate) {
      completedCancelledWhere.startTime = {};
      if (filters.startDate) {
        completedCancelledWhere.startTime.gte = filters.startDate;
      }
      if (filters.endDate) {
        const endOfDay = new Date(filters.endDate);
        endOfDay.setHours(23, 59, 59, 999);
        completedCancelledWhere.startTime.lte = endOfDay;
      }
    }

    const completedCancelledAppointments = await prisma.appointment.findMany({
      where: completedCancelledWhere,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        services: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                description: true,
                priceMin: true,
                priceMax: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
    });

    // Combine all appointments
    const allAppointments = [
      ...pendingConfirmedAppointments,
      ...completedCancelledAppointments,
    ];

    // Serialize Decimal fields
    const serializedAppointments = allAppointments.map((appointment) => ({
      ...appointment,
      totalPrice: Number(appointment.totalPrice),
      services: appointment.services.map((service) => ({
        ...service,
        priceAtBooking: Number(service.priceAtBooking),
      })),
    }));

    return {
      success: true,
      data: serializedAppointments,
    };
  } catch (error) {
    console.error("Error fetching provider appointments:", error);
    return {
      success: false,
      error: "Failed to fetch appointments",
    };
  }
}

// Get appointment statistics
export async function getAppointmentStatistics(filters?: {
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in",
      };
    }

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

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    // Count today's appointments
    const todayCount = await prisma.appointment.count({
      where: {
        providerId: provider.id,
        startTime: {
          gte: today,
          lte: endOfToday,
        },
      },
    });

    // Build date filter for other stats
    const dateFilter: Prisma.AppointmentWhereInput = {};
    if (filters?.startDate || filters?.endDate) {
      dateFilter.startTime = {};
      if (filters.startDate) {
        dateFilter.startTime.gte = filters.startDate;
      }
      if (filters.endDate) {
        const endOfDay = new Date(filters.endDate);
        endOfDay.setHours(23, 59, 59, 999);
        dateFilter.startTime.lte = endOfDay;
      }
    }

    // Count by status
    const [pending, confirmed, completed, cancelled, total] = await Promise.all([
      prisma.appointment.count({
        where: {
          providerId: provider.id,
          status: "PENDING",
        },
      }),
      prisma.appointment.count({
        where: {
          providerId: provider.id,
          status: "CONFIRMED",
        },
      }),
      prisma.appointment.count({
        where: {
          providerId: provider.id,
          status: "COMPLETED",
          ...dateFilter,
        },
      }),
      prisma.appointment.count({
        where: {
          providerId: provider.id,
          status: "CANCELLED",
          ...dateFilter,
        },
      }),
      prisma.appointment.count({
        where: {
          providerId: provider.id,
          ...dateFilter,
        },
      }),
    ]);

    return {
      success: true,
      data: {
        today: todayCount,
        pending,
        confirmed,
        completed,
        cancelled,
        total,
      },
    };
  } catch (error) {
    console.error("Error fetching appointment statistics:", error);
    return {
      success: false,
      error: "Failed to fetch statistics",
    };
  }
}

// Update appointment status
export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus,
  activityNotes?: string
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in",
      };
    }

    const provider = await prisma.provider.findUnique({
      where: { userId: session.user.id },
      select: { id: true, healthcareName: true },
    });

    if (!provider) {
      return {
        success: false,
        error: "Provider profile not found",
      };
    }

    // Verify appointment belongs to provider
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        providerId: provider.id,
      },
    });

    if (!appointment) {
      return {
        success: false,
        error: "Appointment not found",
      };
    }

    // Update appointment status and create notification in transaction
    const updatedAppointment = await prisma.$transaction(async (tx) => {
      // Update appointment status (and activity notes if completing)
      const updated = await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          status,
          ...(status === "COMPLETED" && activityNotes ? { activityNotes } : {}),
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          services: {
            include: {
              service: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      // Create notification for the user based on status change
      if (status === "CONFIRMED") {
        await tx.notification.create({
          data: {
            userId: appointment.userId,
            type: "APPOINTMENT_CONFIRMED",
            title: "Appointment Confirmed",
            message: `Your appointment at ${provider.healthcareName} on ${format(appointment.startTime, "MMM dd, yyyy 'at' h:mm a")} has been confirmed!`,
            appointmentId: appointment.id,
            providerId: provider.id,
          },
        });
      } else if (status === "COMPLETED") {
        const activityMessage = activityNotes
          ? `\n\nActivity Summary: ${activityNotes}`
          : "";
        await tx.notification.create({
          data: {
            userId: appointment.userId,
            type: "APPOINTMENT_CONFIRMED",
            title: "Appointment Completed",
            message: `Your appointment at ${provider.healthcareName} has been marked as completed. Thank you!${activityMessage}`,
            appointmentId: appointment.id,
            providerId: provider.id,
          },
        });
      }

      return updated;
    });

    revalidatePath("/provider/appointments");
    revalidatePath("/dashboard");

    // Serialize Decimal fields
    const serializedAppointment = {
      ...updatedAppointment,
      totalPrice: Number(updatedAppointment.totalPrice),
      services: updatedAppointment.services.map((service) => ({
        ...service,
        priceAtBooking: Number(service.priceAtBooking),
      })),
    };

    return {
      success: true,
      data: serializedAppointment,
      message: `Appointment ${status.toLowerCase()} successfully`,
    };
  } catch (error) {
    console.error("Error updating appointment status:", error);
    return {
      success: false,
      error: "Failed to update appointment status",
    };
  }
}

// Cancel appointment
export async function cancelAppointment(
  appointmentId: string,
  reason: string
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in",
      };
    }

    const provider = await prisma.provider.findUnique({
      where: { userId: session.user.id },
      select: { id: true, healthcareName: true },
    });

    if (!provider) {
      return {
        success: false,
        error: "Provider profile not found",
      };
    }

    // Verify appointment belongs to provider
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        providerId: provider.id,
      },
    });

    if (!appointment) {
      return {
        success: false,
        error: "Appointment not found",
      };
    }

    // Cancel appointment and create notification in transaction
    const cancelledAppointment = await prisma.$transaction(async (tx) => {
      // Cancel appointment
      const cancelled = await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancellationReason: reason,
          cancelledBy: session.user.id,
        },
      });

      // Notify the user who booked the appointment
      await tx.notification.create({
        data: {
          userId: appointment.userId,
          type: "APPOINTMENT_CANCELLED",
          title: "Appointment Cancelled",
          message: `Your appointment at ${provider.healthcareName} on ${format(appointment.startTime, "MMM dd, yyyy 'at' h:mm a")} has been cancelled. Reason: ${reason}`,
          appointmentId: appointment.id,
          providerId: provider.id,
        },
      });

      return cancelled;
    });

    revalidatePath("/provider/appointments");
    revalidatePath("/dashboard");

    // Serialize Decimal fields
    const serializedAppointment = {
      ...cancelledAppointment,
      totalPrice: Number(cancelledAppointment.totalPrice),
    };

    return {
      success: true,
      data: serializedAppointment,
      message: "Appointment cancelled successfully",
    };
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return {
      success: false,
      error: "Failed to cancel appointment",
    };
  }
}

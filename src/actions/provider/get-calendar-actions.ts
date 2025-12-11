"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Get provider's appointments for calendar view
export async function getCalendarAppointments(filters?: {
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

    // Build where clause
    const whereClause: Prisma.AppointmentWhereInput = {
      providerId: provider.id,
      status: {
        in: ["PENDING", "CONFIRMED", "COMPLETED"],
      },
    };

    // Add date range filter
    if (filters?.startDate || filters?.endDate) {
      whereClause.startTime = {};
      if (filters.startDate) {
        whereClause.startTime.gte = filters.startDate;
      }
      if (filters.endDate) {
        const endOfDay = new Date(filters.endDate);
        endOfDay.setHours(23, 59, 59, 999);
        whereClause.startTime.lte = endOfDay;
      }
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
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
              },
            },
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    // Serialize Decimal fields
    const serializedAppointments = appointments.map((appointment) => ({
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
    console.error("Error fetching calendar appointments:", error);
    return {
      success: false,
      error: "Failed to fetch appointments",
    };
  }
}

// Get appointments for a specific day
export async function getDayAppointments(date: Date) {
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

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        providerId: provider.id,
        status: {
          in: ["PENDING", "CONFIRMED", "COMPLETED"],
        },
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
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
              },
            },
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    const serializedAppointments = appointments.map((appointment) => ({
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
    console.error("Error fetching day appointments:", error);
    return {
      success: false,
      error: "Failed to fetch appointments",
    };
  }
}

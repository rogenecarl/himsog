import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { verifyMobileAuth } from "@/lib/mobile-auth-middleware";
import { handleCorsPrelight, jsonResponse } from "@/lib/cors";

export async function OPTIONS() {
  return handleCorsPrelight();
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyMobileAuth(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const userId = authResult.user.id;
    const now = new Date();

    // Get stats and next appointment in parallel
    const [total, upcoming, completed, cancelled, nextAppointment] =
      await Promise.all([
        // Total appointments
        prisma.appointment.count({
          where: { userId },
        }),
        // Upcoming appointments
        prisma.appointment.count({
          where: {
            userId,
            startTime: { gte: now },
            status: { in: ["PENDING", "CONFIRMED"] },
          },
        }),
        // Completed appointments
        prisma.appointment.count({
          where: {
            userId,
            status: "COMPLETED",
          },
        }),
        // Cancelled appointments
        prisma.appointment.count({
          where: {
            userId,
            status: "CANCELLED",
          },
        }),
        // Next upcoming appointment
        prisma.appointment.findFirst({
          where: {
            userId,
            startTime: { gte: now },
            status: { in: ["PENDING", "CONFIRMED"] },
          },
          include: {
            provider: {
              select: {
                id: true,
                healthcareName: true,
                address: true,
                city: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            services: {
              include: {
                service: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            startTime: "asc",
          },
        }),
      ]);

    // Serialize next appointment
    const serializedNextAppointment = nextAppointment
      ? {
          id: nextAppointment.id,
          appointmentNumber: nextAppointment.appointmentNumber,
          startTime: nextAppointment.startTime.toISOString(),
          endTime: nextAppointment.endTime.toISOString(),
          status: nextAppointment.status,
          totalPrice: nextAppointment.totalPrice
            ? Number(nextAppointment.totalPrice)
            : 0,
          provider: {
            id: nextAppointment.provider.id,
            healthcareName: nextAppointment.provider.healthcareName,
            address: nextAppointment.provider.address,
            city: nextAppointment.provider.city,
            category: nextAppointment.provider.category,
          },
          services: nextAppointment.services.map((s) => ({
            id: s.service.id,
            name: s.service.name,
            priceAtBooking: s.priceAtBooking ? Number(s.priceAtBooking) : 0,
          })),
        }
      : null;

    return jsonResponse({
      success: true,
      data: {
        stats: {
          total,
          upcoming,
          completed,
          cancelled,
        },
        nextAppointment: serializedNextAppointment,
        user: {
          id: authResult.user.id,
          name: authResult.user.name,
          email: authResult.user.email,
          image: authResult.user.image,
        },
      },
    });
  } catch (error) {
    console.error("Mobile dashboard error:", error);
    return jsonResponse(
      { success: false, error: "Failed to fetch dashboard data" },
      500
    );
  }
}

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { verifyMobileAuth } from "@/lib/mobile-auth-middleware";
import { handleCorsPrelight, jsonResponse } from "@/lib/cors";

export async function OPTIONS() {
  return handleCorsPrelight();
}

// GET /api/mobile/user/appointments - Get all appointments
// Query params: ?type=all|upcoming|past
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyMobileAuth(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const userId = authResult.user.id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all";
    const now = new Date();

    let whereClause: object = { userId };

    if (type === "upcoming") {
      whereClause = {
        userId,
        startTime: { gte: now },
        status: { in: ["PENDING", "CONFIRMED"] },
      };
    } else if (type === "past") {
      whereClause = {
        userId,
        OR: [
          { startTime: { lt: now } },
          { status: { in: ["COMPLETED", "CANCELLED", "NO_SHOW"] } },
        ],
      };
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        provider: {
          select: {
            id: true,
            healthcareName: true,
            address: true,
            city: true,
            province: true,
            coverPhoto: true,
            latitude: true,
            longitude: true,
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
                description: true,
              },
            },
          },
        },
        review: {
          select: {
            id: true,
            rating: true,
          },
        },
      },
      orderBy: {
        startTime: type === "upcoming" ? "asc" : "desc",
      },
      take: type === "all" ? 50 : type === "upcoming" ? 10 : 20,
    });

    // Serialize appointments
    const serializedAppointments = appointments.map((apt) => ({
      id: apt.id,
      appointmentNumber: apt.appointmentNumber,
      startTime: apt.startTime.toISOString(),
      endTime: apt.endTime.toISOString(),
      status: apt.status,
      totalPrice: apt.totalPrice ? Number(apt.totalPrice) : 0,
      patientName: apt.patientName,
      patientEmail: apt.patientEmail,
      patientPhone: apt.patientPhone,
      notes: apt.notes,
      cancellationReason: apt.cancellationReason,
      cancelledAt: apt.cancelledAt?.toISOString() || null,
      createdAt: apt.createdAt.toISOString(),
      hasReview: !!apt.review,
      provider: {
        id: apt.provider.id,
        healthcareName: apt.provider.healthcareName,
        address: apt.provider.address,
        city: apt.provider.city,
        province: apt.provider.province,
        coverPhoto: apt.provider.coverPhoto,
        latitude: apt.provider.latitude ? Number(apt.provider.latitude) : null,
        longitude: apt.provider.longitude
          ? Number(apt.provider.longitude)
          : null,
        category: apt.provider.category,
      },
      services: apt.services.map((s) => ({
        id: s.service.id,
        name: s.service.name,
        description: s.service.description,
        priceAtBooking: s.priceAtBooking ? Number(s.priceAtBooking) : 0,
      })),
    }));

    return jsonResponse({
      success: true,
      data: serializedAppointments,
    });
  } catch (error) {
    console.error("Mobile appointments error:", error);
    return jsonResponse(
      { success: false, error: "Failed to fetch appointments" },
      500
    );
  }
}

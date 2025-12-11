import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { verifyMobileAuth } from "@/lib/mobile-auth-middleware";
import { handleCorsPrelight, jsonResponse } from "@/lib/cors";
import { z } from "zod/v4";

export async function OPTIONS() {
  return handleCorsPrelight();
}

// GET /api/mobile/user/appointments/[id] - Get appointment details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyMobileAuth(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = await params;
    const userId = authResult.user.id;

    const appointment = await prisma.appointment.findUnique({
      where: {
        id,
        userId, // Ensure user can only access their own appointments
      },
      include: {
        provider: {
          select: {
            id: true,
            healthcareName: true,
            description: true,
            address: true,
            city: true,
            province: true,
            coverPhoto: true,
            latitude: true,
            longitude: true,
            phoneNumber: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
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
            comment: true,
            createdAt: true,
            isEdited: true,
          },
        },
      },
    });

    if (!appointment) {
      return jsonResponse(
        { success: false, error: "Appointment not found" },
        404
      );
    }

    // Serialize appointment
    const serializedAppointment = {
      id: appointment.id,
      appointmentNumber: appointment.appointmentNumber,
      startTime: appointment.startTime.toISOString(),
      endTime: appointment.endTime.toISOString(),
      status: appointment.status,
      totalPrice: appointment.totalPrice ? Number(appointment.totalPrice) : 0,
      patientName: appointment.patientName,
      patientEmail: appointment.patientEmail,
      patientPhone: appointment.patientPhone,
      notes: appointment.notes,
      activityNotes: appointment.activityNotes,
      cancellationReason: appointment.cancellationReason,
      cancelledAt: appointment.cancelledAt?.toISOString() || null,
      cancelledBy: appointment.cancelledBy,
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
      provider: {
        id: appointment.provider.id,
        healthcareName: appointment.provider.healthcareName,
        description: appointment.provider.description,
        address: appointment.provider.address,
        city: appointment.provider.city,
        province: appointment.provider.province,
        coverPhoto: appointment.provider.coverPhoto,
        phoneNumber: appointment.provider.phoneNumber,
        latitude: appointment.provider.latitude
          ? Number(appointment.provider.latitude)
          : null,
        longitude: appointment.provider.longitude
          ? Number(appointment.provider.longitude)
          : null,
        category: appointment.provider.category,
        user: appointment.provider.user,
      },
      services: appointment.services.map((s) => ({
        id: s.service.id,
        name: s.service.name,
        description: s.service.description,
        priceAtBooking: s.priceAtBooking ? Number(s.priceAtBooking) : 0,
      })),
      review: appointment.review
        ? {
            id: appointment.review.id,
            rating: appointment.review.rating,
            comment: appointment.review.comment,
            createdAt: appointment.review.createdAt.toISOString(),
            isEdited: appointment.review.isEdited,
          }
        : null,
    };

    return jsonResponse({
      success: true,
      data: serializedAppointment,
    });
  } catch (error) {
    console.error("Mobile appointment detail error:", error);
    return jsonResponse(
      { success: false, error: "Failed to fetch appointment details" },
      500
    );
  }
}

// DELETE /api/mobile/user/appointments/[id] - Cancel appointment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyMobileAuth(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = await params;
    const userId = authResult.user.id;

    // Parse request body for cancellation reason
    const body = await request.json().catch(() => ({}));
    const cancelSchema = z.object({
      reason: z.string().min(1, "Cancellation reason is required"),
      notes: z.string().optional(),
    });

    const parsed = cancelSchema.safeParse(body);
    if (!parsed.success) {
      return jsonResponse(
        { success: false, error: "Cancellation reason is required" },
        400
      );
    }

    // Find the appointment
    const appointment = await prisma.appointment.findUnique({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
        status: true,
        startTime: true,
      },
    });

    if (!appointment) {
      return jsonResponse(
        { success: false, error: "Appointment not found" },
        404
      );
    }

    // Check if appointment can be cancelled
    if (!["PENDING", "CONFIRMED"].includes(appointment.status)) {
      return jsonResponse(
        {
          success: false,
          error: "Only pending or confirmed appointments can be cancelled",
        },
        400
      );
    }

    // Check if appointment is in the past
    if (new Date(appointment.startTime) < new Date()) {
      return jsonResponse(
        { success: false, error: "Cannot cancel past appointments" },
        400
      );
    }

    // Cancel the appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancelledBy: "USER",
        cancellationReason: parsed.data.reason,
        activityNotes: parsed.data.notes || null,
      },
      select: {
        id: true,
        appointmentNumber: true,
        status: true,
        cancelledAt: true,
        cancellationReason: true,
      },
    });

    return jsonResponse({
      success: true,
      data: {
        message: "Appointment cancelled successfully",
        appointment: {
          id: updatedAppointment.id,
          appointmentNumber: updatedAppointment.appointmentNumber,
          status: updatedAppointment.status,
          cancelledAt: updatedAppointment.cancelledAt?.toISOString(),
          cancellationReason: updatedAppointment.cancellationReason,
        },
      },
    });
  } catch (error) {
    console.error("Mobile cancel appointment error:", error);
    return jsonResponse(
      { success: false, error: "Failed to cancel appointment" },
      500
    );
  }
}

"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CreateUserAppointmentFormType, CreateAppointmentSchema } from "@/schemas/create-user-appointment.schema";
import { addMinutes, format } from "date-fns";
import { revalidatePath } from "next/cache";
import { createLocalDateTime } from "@/lib/utils/time-format";

export async function createUserAppointment(data: CreateUserAppointmentFormType) {
  try {
    // Validate the data with the strict schema
    const validatedData = CreateAppointmentSchema.parse(data);

    // Get the current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("You must be logged in to create an appointment");
    }

    // Validate that the provider exists and is verified
    const provider = await prisma.provider.findUnique({
      where: { 
        id: validatedData.providerId,
        status: "VERIFIED" // Only allow appointments with verified providers
      },
      include: {
        services: {
          where: {
            id: { in: validatedData.selectedServices.map(s => s.id) },
            isActive: true
          }
        }
      }
    });

    if (!provider) {
      throw new Error("Provider not found or not available for appointments");
    }

    // Validate that all selected services belong to this provider
    if (provider.services.length !== validatedData.selectedServices.length) {
      throw new Error("Some selected services are not available");
    }

    // Calculate appointment duration based on provider's slot duration
    const appointmentDuration = provider.slotDuration || 30; // Default 30 minutes
    
    // Create start and end times using utility function that handles timezone correctly
    // This ensures 10:30 AM local time is stored as 10:30 AM in the database
    const startTime = createLocalDateTime(validatedData.selectedDate, validatedData.selectedTime);
    const endTime = addMinutes(startTime, appointmentDuration);

    // Check for appointment conflicts
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        providerId: validatedData.providerId,
        status: { in: ["PENDING", "CONFIRMED"] },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } }
            ]
          }
        ]
      }
    });

    if (conflictingAppointment) {
      throw new Error("This time slot is no longer available. Please select another time.");
    }

    // Generate unique appointment number
    const appointmentNumber = `APT${Date.now().toString().slice(-8)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Create the appointment with transaction
    const appointment = await prisma.$transaction(async (tx) => {
      // Create the appointment
      const newAppointment = await tx.appointment.create({
        data: {
          appointmentNumber,
          userId: session.user.id,
          providerId: validatedData.providerId,
          startTime,
          endTime,
          status: "PENDING",
          totalPrice: validatedData.totalPrice,
          patientName: validatedData.patientName,
          patientEmail: validatedData.patientEmail,
          patientPhone: validatedData.patientPhone || null,
          notes: validatedData.notes || null,
        },
      });

      // Create appointment services
      await tx.appointmentService.createMany({
        data: validatedData.selectedServices.map(service => ({
          appointmentId: newAppointment.id,
          serviceId: service.id,
          priceAtBooking: service.price,
        })),
      });

      // Create notification for provider
      await tx.notification.create({
        data: {
          userId: provider.userId, // Notify the user who owns the provider account
          type: "APPOINTMENT_CREATED",
          title: "New Appointment Request",
          message: `${validatedData.patientName} has requested an appointment on ${format(startTime, "MMM dd, yyyy 'at' h:mm a")}`,
          appointmentId: newAppointment.id,
          providerId: provider.id,
        },
      });

      return newAppointment;
    });

    // Revalidate relevant paths
    revalidatePath("/appointments");
    revalidatePath("/dashboard");
    revalidatePath(`/provider/${validatedData.providerId}`);

    return {
      success: true,
      data: {
        appointmentId: appointment.id,
        appointmentNumber: appointment.appointmentNumber,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
      },
      message: "Appointment created successfully!",
    };

  } catch (error) {
    console.error("Error creating appointment:", error);
    
    // Handle Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      const zodError = error as { issues: Array<{ message?: string }> };
      const firstIssue = zodError.issues?.[0];
      return {
        success: false,
        error: firstIssue?.message || "Invalid appointment data",
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create appointment",
    };
  }
}

// Helper function to check appointment availability
export async function checkAppointmentAvailability(
  providerId: string,
  date: Date,
  time: string
) {
  try {
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      select: { slotDuration: true }
    });

    if (!provider) {
      return { available: false, reason: "Provider not found" };
    }

    // Use the same utility function to ensure consistency
    const startTime = createLocalDateTime(date, time);
    const endTime = addMinutes(startTime, provider.slotDuration || 30);

    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        providerId,
        status: { in: ["PENDING", "CONFIRMED"] },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } }
            ]
          }
        ]
      }
    });

    return {
      available: !conflictingAppointment,
      reason: conflictingAppointment ? "Time slot is already booked" : null
    };

  } catch (error) {
    console.error("Error checking availability:", error);
    return { available: false, reason: "Error checking availability" };
  }
}
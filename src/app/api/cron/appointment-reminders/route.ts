import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resend, FROM_EMAIL } from "@/lib/resend";
import {
  getAppointmentReminderEmailHtml,
  type AppointmentEmailOptions,
  type ReminderType,
} from "@/lib/email-template";
import { format } from "date-fns";

// Helper to format price
function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(price);
}

// Helper to build appointment email options
function buildEmailOptions(
  appointment: {
    appointmentNumber: string;
    patientName: string;
    patientEmail: string;
    startTime: Date;
    totalPrice: { toNumber: () => number } | number;
    provider: {
      healthcareName: string;
      address: string;
      city: string;
      province: string;
    };
    services: Array<{
      service: {
        name: string;
      };
    }>;
  },
  appUrl: string
): AppointmentEmailOptions {
  const totalPrice =
    typeof appointment.totalPrice === "number"
      ? appointment.totalPrice
      : appointment.totalPrice.toNumber();

  return {
    patientName: appointment.patientName,
    patientEmail: appointment.patientEmail,
    providerName: appointment.provider.healthcareName,
    providerAddress: `${appointment.provider.address}, ${appointment.provider.city}, ${appointment.provider.province}`,
    appointmentNumber: appointment.appointmentNumber,
    appointmentDate: format(appointment.startTime, "MMMM d, yyyy"),
    appointmentTime: format(appointment.startTime, "h:mm a"),
    services: appointment.services.map((s) => s.service.name),
    totalPrice: formatPrice(totalPrice),
    appointmentUrl: `${appUrl}/dashboard/appointments`,
  };
}

// Send reminder email and update the database
async function sendReminderAndUpdate(
  appointmentId: string,
  emailOptions: AppointmentEmailOptions,
  reminderType: ReminderType,
  field: "reminder24hSentAt" | "reminder1hSentAt"
): Promise<{ success: boolean; error?: string }> {
  try {
    const emailHtml = getAppointmentReminderEmailHtml(emailOptions, reminderType);

    const subjectMap: Record<ReminderType, string> = {
      "24h": "Reminder: Your Appointment is Tomorrow",
      "1h": "Your Appointment is in 1 Hour",
    };

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: emailOptions.patientEmail,
      subject: subjectMap[reminderType],
      html: emailHtml,
    });

    if (error) {
      console.error(`Failed to send ${reminderType} reminder for ${appointmentId}:`, error);
      return { success: false, error: error.message };
    }

    // Update the appointment to mark reminder as sent
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { [field]: new Date() },
    });

    // Create in-app notification
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: {
        userId: true,
        providerId: true,
        startTime: true,
        provider: { select: { healthcareName: true } },
      },
    });

    if (appointment) {
      await prisma.notification.create({
        data: {
          userId: appointment.userId,
          type: "APPOINTMENT_REMINDER",
          title:
            reminderType === "24h"
              ? "Appointment Tomorrow"
              : "Appointment in 1 Hour",
          message:
            reminderType === "24h"
              ? `Reminder: Your appointment at ${appointment.provider.healthcareName} is tomorrow at ${format(appointment.startTime, "h:mm a")}.`
              : `Your appointment at ${appointment.provider.healthcareName} is in about 1 hour at ${format(appointment.startTime, "h:mm a")}.`,
          appointmentId: appointmentId,
          providerId: appointment.providerId,
        },
      });
    }

    return { success: true };
  } catch (err) {
    console.error(`Error sending ${reminderType} reminder for ${appointmentId}:`, err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function GET(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("CRON_SECRET environment variable is not set");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const now = new Date();

  // Results tracking
  const results = {
    reminder24h: { sent: 0, failed: 0, errors: [] as string[] },
    reminder1h: { sent: 0, failed: 0, errors: [] as string[] },
  };

  try {
    // =========================================================================
    // 24-HOUR REMINDERS
    // Find appointments that:
    // - Are CONFIRMED
    // - Start between 23 and 25 hours from now (to catch the 24h window)
    // - Haven't had 24h reminder sent yet
    // =========================================================================
    const reminder24hStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const reminder24hEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const appointments24h = await prisma.appointment.findMany({
      where: {
        status: "CONFIRMED",
        startTime: {
          gte: reminder24hStart,
          lte: reminder24hEnd,
        },
        reminder24hSentAt: null,
      },
      include: {
        provider: {
          select: {
            healthcareName: true,
            address: true,
            city: true,
            province: true,
          },
        },
        services: {
          include: {
            service: {
              select: { name: true },
            },
          },
        },
      },
    });

    console.log(`Found ${appointments24h.length} appointments for 24h reminder`);

    for (const appointment of appointments24h) {
      const emailOptions = buildEmailOptions(appointment, appUrl);
      const result = await sendReminderAndUpdate(
        appointment.id,
        emailOptions,
        "24h",
        "reminder24hSentAt"
      );

      if (result.success) {
        results.reminder24h.sent++;
      } else {
        results.reminder24h.failed++;
        if (result.error) {
          results.reminder24h.errors.push(
            `${appointment.appointmentNumber}: ${result.error}`
          );
        }
      }
    }

    // =========================================================================
    // 1-HOUR REMINDERS
    // Find appointments that:
    // - Are CONFIRMED
    // - Start between 50 and 70 minutes from now (to catch the 1h window)
    // - Haven't had 1h reminder sent yet
    // =========================================================================
    const reminder1hStart = new Date(now.getTime() + 50 * 60 * 1000);
    const reminder1hEnd = new Date(now.getTime() + 70 * 60 * 1000);

    const appointments1h = await prisma.appointment.findMany({
      where: {
        status: "CONFIRMED",
        startTime: {
          gte: reminder1hStart,
          lte: reminder1hEnd,
        },
        reminder1hSentAt: null,
      },
      include: {
        provider: {
          select: {
            healthcareName: true,
            address: true,
            city: true,
            province: true,
          },
        },
        services: {
          include: {
            service: {
              select: { name: true },
            },
          },
        },
      },
    });

    console.log(`Found ${appointments1h.length} appointments for 1h reminder`);

    for (const appointment of appointments1h) {
      const emailOptions = buildEmailOptions(appointment, appUrl);
      const result = await sendReminderAndUpdate(
        appointment.id,
        emailOptions,
        "1h",
        "reminder1hSentAt"
      );

      if (result.success) {
        results.reminder1h.sent++;
      } else {
        results.reminder1h.failed++;
        if (result.error) {
          results.reminder1h.errors.push(
            `${appointment.appointmentNumber}: ${result.error}`
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      results: {
        reminder24h: {
          found: appointments24h.length,
          sent: results.reminder24h.sent,
          failed: results.reminder24h.failed,
        },
        reminder1h: {
          found: appointments1h.length,
          sent: results.reminder1h.sent,
          failed: results.reminder1h.failed,
        },
      },
      ...(results.reminder24h.errors.length > 0 ||
      results.reminder1h.errors.length > 0
        ? {
            errors: {
              reminder24h: results.reminder24h.errors,
              reminder1h: results.reminder1h.errors,
            },
          }
        : {}),
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: now.toISOString(),
      },
      { status: 500 }
    );
  }
}

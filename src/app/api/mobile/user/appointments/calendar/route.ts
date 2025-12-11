import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { verifyMobileAuth } from "@/lib/mobile-auth-middleware";
import { handleCorsPrelight, jsonResponse } from "@/lib/cors";

export async function OPTIONS() {
  return handleCorsPrelight();
}

// GET /api/mobile/user/appointments/calendar?month=2024-01
// Returns appointments for a specific month for calendar display
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyMobileAuth(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const userId = authResult.user.id;
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get("month");

    // Default to current month if not provided
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();

    if (monthParam) {
      const [yearStr, monthStr] = monthParam.split("-");
      year = parseInt(yearStr, 10);
      month = parseInt(monthStr, 10) - 1; // Convert to 0-indexed
    }

    // Get start and end of the month
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        userId,
        startTime: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        id: true,
        appointmentNumber: true,
        startTime: true,
        endTime: true,
        status: true,
        provider: {
          select: {
            id: true,
            healthcareName: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    // Group appointments by date for calendar display
    const appointmentsByDate: Record<
      string,
      Array<{
        id: string;
        appointmentNumber: string;
        startTime: string;
        endTime: string;
        status: string;
        providerName: string;
        categoryName: string;
      }>
    > = {};

    appointments.forEach((apt) => {
      const dateKey = apt.startTime.toISOString().split("T")[0];
      if (!appointmentsByDate[dateKey]) {
        appointmentsByDate[dateKey] = [];
      }
      appointmentsByDate[dateKey].push({
        id: apt.id,
        appointmentNumber: apt.appointmentNumber,
        startTime: apt.startTime.toISOString(),
        endTime: apt.endTime.toISOString(),
        status: apt.status,
        providerName: apt.provider.healthcareName,
        categoryName: apt.provider.category?.name || "Healthcare",
      });
    });

    return jsonResponse({
      success: true,
      data: {
        month: `${year}-${String(month + 1).padStart(2, "0")}`,
        appointments: appointmentsByDate,
        totalAppointments: appointments.length,
      },
    });
  } catch (error) {
    console.error("Mobile calendar error:", error);
    return jsonResponse(
      { success: false, error: "Failed to fetch calendar data" },
      500
    );
  }
}

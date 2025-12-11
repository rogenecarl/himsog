"use server";

import prisma from "@/lib/prisma";
import { requireProvider } from "@/actions/auth/auth-check-utils";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

export interface DashboardStats {
  todayAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  totalServices: number;
  rating: number;
  totalReviews: number;
  todayRevenue: number;
  unreadMessages: number;
  weeklyTrend: {
    appointments: number;
    change: number;
  };
}

export interface TodayAppointment {
  id: string;
  appointmentNumber: string;
  startTime: Date;
  endTime: Date;
  status: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string | null;
  totalPrice: number;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  services: {
    service: {
      name: string;
    };
    priceAtBooking: number;
  }[];
}

export interface Activity {
  id: string;
  type: "BOOKING" | "REVIEW" | "MESSAGE";
  title: string;
  description: string | null;
  createdAt: Date;
  metadata?: {
    rating?: number;
    userName?: string;
  };
}

export async function getDashboardStats(): Promise<{
  success: boolean;
  data?: DashboardStats;
  error?: string;
}> {
  const user = await requireProvider();

  try {
    const provider = await prisma.provider.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!provider) {
      return { success: false, error: "Provider profile not found" };
    }

    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);
    const weekAgo = subDays(today, 7);

    const [
      todayAppointments,
      pendingAppointments,
      confirmedAppointments,
      totalServices,
      reviewStats,
      todayRevenue,
      unreadMessages,
      thisWeekAppointments,
      lastWeekAppointments,
    ] = await Promise.all([
      // Today's appointments
      prisma.appointment.count({
        where: {
          providerId: provider.id,
          startTime: { gte: startOfToday, lte: endOfToday },
        },
      }),
      // Pending appointments
      prisma.appointment.count({
        where: {
          providerId: provider.id,
          status: "PENDING",
        },
      }),
      // Confirmed appointments
      prisma.appointment.count({
        where: {
          providerId: provider.id,
          status: "CONFIRMED",
        },
      }),
      // Active services - count only SINGLE and PACKAGE types, exclude services that are part of packages
      prisma.service.count({
        where: {
          providerId: provider.id,
          isActive: true,
          type: { in: ["SINGLE", "PACKAGE"] },
          // Exclude services that are included in packages (partOfPackages)
          partOfPackages: { none: {} },
        },
      }),
      // Review stats
      prisma.review.aggregate({
        where: { providerId: provider.id },
        _avg: { rating: true },
        _count: true,
      }),
      // Today's revenue (completed appointments)
      prisma.appointment.aggregate({
        where: {
          providerId: provider.id,
          status: "COMPLETED",
          startTime: { gte: startOfToday, lte: endOfToday },
        },
        _sum: { totalPrice: true },
      }),
      // Unread messages - count messages in conversations where provider's user is a participant
      prisma.message.count({
        where: {
          OR: [
            {
              conversation: {
                user1Id: user.id,
              },
              senderId: { not: user.id },
            },
            {
              conversation: {
                user2Id: user.id,
              },
              senderId: { not: user.id },
            },
          ],
          status: { not: "READ" },
        },
      }),
      // This week appointments
      prisma.appointment.count({
        where: {
          providerId: provider.id,
          createdAt: { gte: weekAgo },
        },
      }),
      // Last week appointments
      prisma.appointment.count({
        where: {
          providerId: provider.id,
          createdAt: { gte: subDays(weekAgo, 7), lt: weekAgo },
        },
      }),
    ]);

    const weeklyChange =
      lastWeekAppointments > 0
        ? Math.round(
            ((thisWeekAppointments - lastWeekAppointments) /
              lastWeekAppointments) *
              100
          )
        : thisWeekAppointments > 0
          ? 100
          : 0;

    return {
      success: true,
      data: {
        todayAppointments,
        pendingAppointments,
        confirmedAppointments,
        totalServices,
        rating: reviewStats._avg.rating ?? 0,
        totalReviews: reviewStats._count,
        todayRevenue: todayRevenue._sum.totalPrice?.toNumber() ?? 0,
        unreadMessages,
        weeklyTrend: {
          appointments: thisWeekAppointments,
          change: weeklyChange,
        },
      },
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return { success: false, error: "Failed to fetch dashboard stats" };
  }
}

export async function getTodayAppointments(): Promise<{
  success: boolean;
  data?: TodayAppointment[];
  error?: string;
}> {
  const user = await requireProvider();

  try {
    const provider = await prisma.provider.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!provider) {
      return { success: false, error: "Provider profile not found" };
    }

    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    const appointments = await prisma.appointment.findMany({
      where: {
        providerId: provider.id,
        startTime: { gte: startOfToday, lte: endOfToday },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        services: {
          include: {
            service: { select: { name: true } },
          },
        },
      },
      orderBy: { startTime: "asc" },
    });

    // Serialize the data
    const serializedAppointments = appointments.map((apt) => ({
      id: apt.id,
      appointmentNumber: apt.appointmentNumber,
      startTime: apt.startTime,
      endTime: apt.endTime,
      status: apt.status,
      patientName: apt.patientName,
      patientEmail: apt.patientEmail,
      patientPhone: apt.patientPhone,
      totalPrice: Number(apt.totalPrice),
      user: apt.user,
      services: apt.services.map((s) => ({
        service: { name: s.service.name },
        priceAtBooking: Number(s.priceAtBooking),
      })),
    }));

    return { success: true, data: serializedAppointments };
  } catch (error) {
    console.error("Failed to fetch today's appointments:", error);
    return { success: false, error: "Failed to fetch today's appointments" };
  }
}

export async function getRecentActivities(
  limit = 10
): Promise<{
  success: boolean;
  data?: Activity[];
  error?: string;
}> {
  const user = await requireProvider();

  try {
    const provider = await prisma.provider.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!provider) {
      return { success: false, error: "Provider profile not found" };
    }

    // Fetch recent activities from multiple sources
    const [recentAppointments, recentReviews, recentMessages] =
      await Promise.all([
        // Recent appointment bookings
        prisma.appointment.findMany({
          where: { providerId: provider.id },
          orderBy: { createdAt: "desc" },
          take: limit,
          include: {
            user: { select: { name: true } },
          },
        }),
        // Recent reviews
        prisma.review.findMany({
          where: { providerId: provider.id },
          orderBy: { createdAt: "desc" },
          take: limit,
          include: {
            user: { select: { name: true } },
          },
        }),
        // Recent messages from conversations where provider is a participant
        prisma.message.findMany({
          where: {
            OR: [
              {
                conversation: { user1Id: user.id },
                senderId: { not: user.id },
              },
              {
                conversation: { user2Id: user.id },
                senderId: { not: user.id },
              },
            ],
          },
          orderBy: { createdAt: "desc" },
          take: limit,
          include: {
            sender: { select: { name: true } },
          },
        }),
      ]);

    // Combine and sort activities
    const activities: Activity[] = [
      ...recentAppointments.map((apt) => ({
        id: apt.id,
        type: "BOOKING" as const,
        title: `New appointment from ${apt.user.name}`,
        description: `Booked for ${format(apt.startTime, "MMM dd, yyyy 'at' h:mm a")}`,
        createdAt: apt.createdAt,
        metadata: {
          userName: apt.user.name,
        },
      })),
      ...recentReviews.map((review) => ({
        id: review.id,
        type: "REVIEW" as const,
        title: `New ${review.rating}-star review from ${review.user.name}`,
        description: review.comment?.slice(0, 100) || null,
        createdAt: review.createdAt,
        metadata: {
          rating: review.rating,
          userName: review.user.name,
        },
      })),
      ...recentMessages.map((msg) => ({
        id: msg.id,
        type: "MESSAGE" as const,
        title: `New message from ${msg.sender.name}`,
        description: msg.content.slice(0, 100),
        createdAt: msg.createdAt,
        metadata: {
          userName: msg.sender.name,
        },
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, limit);

    return { success: true, data: activities };
  } catch (error) {
    console.error("Failed to fetch activities:", error);
    return { success: false, error: "Failed to fetch activities" };
  }
}

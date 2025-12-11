"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "../auth/auth-check-utils";
import {
  startOfDay,
  endOfDay,
  format,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  subMonths,
} from "date-fns";

// ============================================================================
// TYPES
// ============================================================================

export interface DateRange {
  from: Date;
  to: Date;
}

export interface AdminKPIData {
  totalBookings: number;
  bookingsTrend: number;
  newProvidersMonth: number;
  providersTrend: number;
  activePatients: number;
  patientsTrend: number;
}

export interface ServiceTrendData {
  month: string;
  bookings: number;
}

export interface TopProviderData {
  id: string;
  name: string;
  bookings: number;
  avatar?: string;
}

export interface TopServiceData {
  id: string;
  name: string;
  bookings: number;
  color: string;
}

export interface PeakDayData {
  day: string;
  bookings: number;
}

export interface PeakHourData {
  hour: string;
  bookings: number;
}

export interface ProviderPerformanceData {
  id: string;
  name: string;
  avatar?: string;
  completed: number;
  cancelled: number;
  rating: number;
  avgDuration: number;
}

export interface ActiveUserData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  appointments: number;
  status: "Active" | "Inactive";
}

// ============================================================================
// ADMIN DASHBOARD ANALYTICS
// ============================================================================

export async function getAdminDashboardAnalytics(dateRange: DateRange) {
  try {
    await requireAdmin();

    const { from, to } = dateRange;

    // Calculate previous period for trend comparison
    const periodDuration = to.getTime() - from.getTime();
    const previousFrom = new Date(from.getTime() - periodDuration);
    const previousTo = new Date(from.getTime() - 1);

    // ========================================================================
    // PARALLEL DATABASE QUERIES
    // ========================================================================

    const [
      // Current period appointments
      currentAppointments,
      // Previous period appointments for trend
      previousAppointments,
      // Current period new providers
      currentNewProviders,
      // Previous period new providers
      previousNewProviders,
      // Active patients (users with appointments in period)
      activePatientIds,
      // Previous period active patients
      previousActivePatientIds,
      // All appointments with provider and service details
      appointmentsWithDetails,
      // Provider performance data
      providersWithStats,
      // Top active users
      usersWithAppointments,
      // Monthly trend data (last 6 months)
      monthlyAppointments,
    ] = await Promise.all([
      // Current bookings count
      prisma.appointment.count({
        where: {
          createdAt: { gte: startOfDay(from), lte: endOfDay(to) },
        },
      }),
      // Previous bookings count
      prisma.appointment.count({
        where: {
          createdAt: { gte: startOfDay(previousFrom), lte: endOfDay(previousTo) },
        },
      }),
      // New providers this month
      prisma.provider.count({
        where: {
          createdAt: { gte: startOfDay(from), lte: endOfDay(to) },
        },
      }),
      // Previous period providers
      prisma.provider.count({
        where: {
          createdAt: { gte: startOfDay(previousFrom), lte: endOfDay(previousTo) },
        },
      }),
      // Unique patients in current period
      prisma.appointment.findMany({
        where: {
          createdAt: { gte: startOfDay(from), lte: endOfDay(to) },
        },
        select: { userId: true },
        distinct: ["userId"],
      }),
      // Unique patients in previous period
      prisma.appointment.findMany({
        where: {
          createdAt: { gte: startOfDay(previousFrom), lte: endOfDay(previousTo) },
        },
        select: { userId: true },
        distinct: ["userId"],
      }),
      // Appointments with full details for charts
      prisma.appointment.findMany({
        where: {
          createdAt: { gte: startOfDay(from), lte: endOfDay(to) },
        },
        select: {
          id: true,
          status: true,
          startTime: true,
          createdAt: true,
          totalPrice: true,
          provider: {
            select: {
              id: true,
              healthcareName: true,
              user: {
                select: { image: true },
              },
            },
          },
          services: {
            select: {
              service: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      // Provider performance
      prisma.provider.findMany({
        where: { status: "VERIFIED" },
        select: {
          id: true,
          healthcareName: true,
          user: {
            select: { image: true },
          },
          appointments: {
            where: {
              createdAt: { gte: startOfDay(from), lte: endOfDay(to) },
            },
            select: {
              id: true,
              status: true,
              startTime: true,
              endTime: true,
            },
          },
          reviews: {
            where: {
              createdAt: { gte: startOfDay(from), lte: endOfDay(to) },
            },
            select: { rating: true },
          },
        },
      }),
      // Users with appointment counts
      prisma.user.findMany({
        where: {
          role: "USER",
          appointments: {
            some: {
              createdAt: { gte: startOfDay(from), lte: endOfDay(to) },
            },
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          status: true,
          appointments: {
            where: {
              createdAt: { gte: startOfDay(from), lte: endOfDay(to) },
            },
            select: { id: true },
          },
        },
        orderBy: {
          appointments: {
            _count: "desc",
          },
        },
        take: 10,
      }),
      // Monthly data for trends
      prisma.appointment.findMany({
        where: {
          createdAt: { gte: subMonths(new Date(), 6) },
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    // ========================================================================
    // KPI CALCULATIONS
    // ========================================================================

    const activePatients = activePatientIds.length;
    const previousActivePatients = previousActivePatientIds.length;

    // Calculate trends (percentage change)
    const bookingsTrend = previousAppointments > 0
      ? Math.round(((currentAppointments - previousAppointments) / previousAppointments) * 100 * 10) / 10
      : currentAppointments > 0 ? 100 : 0;

    const providersTrend = previousNewProviders > 0
      ? Math.round(((currentNewProviders - previousNewProviders) / previousNewProviders) * 100 * 10) / 10
      : currentNewProviders > 0 ? 100 : 0;

    const patientsTrend = previousActivePatients > 0
      ? Math.round(((activePatients - previousActivePatients) / previousActivePatients) * 100 * 10) / 10
      : activePatients > 0 ? 100 : 0;

    const kpiData: AdminKPIData = {
      totalBookings: currentAppointments,
      bookingsTrend,
      newProvidersMonth: currentNewProviders,
      providersTrend,
      activePatients,
      patientsTrend,
    };

    // ========================================================================
    // SERVICE TRENDS (Monthly - last 6 months)
    // ========================================================================

    const months = eachMonthOfInterval({
      start: startOfMonth(subMonths(new Date(), 5)),
      end: endOfMonth(new Date()),
    });

    const serviceTrendsData: ServiceTrendData[] = months.map((month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const monthlyBookingsCount = monthlyAppointments.filter((apt) => {
        const aptDate = new Date(apt.createdAt);
        return aptDate >= monthStart && aptDate <= monthEnd;
      }).length;

      return {
        month: format(month, "MMM"),
        bookings: monthlyBookingsCount,
      };
    });

    // ========================================================================
    // TOP PROVIDERS BY BOOKINGS
    // ========================================================================

    const providerBookingCounts = new Map<string, { name: string; count: number; avatar?: string }>();

    appointmentsWithDetails.forEach((apt) => {
      if (apt.provider) {
        const existing = providerBookingCounts.get(apt.provider.id);
        if (existing) {
          existing.count++;
        } else {
          providerBookingCounts.set(apt.provider.id, {
            name: apt.provider.healthcareName,
            count: 1,
            avatar: apt.provider.user?.image || undefined,
          });
        }
      }
    });

    const topProvidersData: TopProviderData[] = Array.from(providerBookingCounts.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        bookings: data.count,
        avatar: data.avatar,
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);

    // ========================================================================
    // TOP SERVICES BY BOOKINGS
    // ========================================================================

    const serviceColors = [
      "#3b82f6", // blue
      "#8b5cf6", // purple
      "#10b981", // green
      "#f59e0b", // amber
      "#ef4444", // red
      "#06b6d4", // cyan
    ];

    const serviceBookingCounts = new Map<string, { name: string; count: number }>();

    appointmentsWithDetails.forEach((apt) => {
      apt.services.forEach((svc) => {
        const existing = serviceBookingCounts.get(svc.service.id);
        if (existing) {
          existing.count++;
        } else {
          serviceBookingCounts.set(svc.service.id, {
            name: svc.service.name,
            count: 1,
          });
        }
      });
    });

    const topServicesData: TopServiceData[] = Array.from(serviceBookingCounts.entries())
      .map(([id, data], index) => ({
        id,
        name: data.name,
        bookings: data.count,
        color: serviceColors[index % serviceColors.length],
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 6);

    // ========================================================================
    // PEAK TIMES (Days and Hours)
    // ========================================================================

    const dayOfWeekNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayBookings = new Map<number, number>();
    const hourBookings = new Map<number, number>();

    appointmentsWithDetails.forEach((apt) => {
      const aptDate = new Date(apt.startTime);
      const dayOfWeek = aptDate.getDay();
      const hour = aptDate.getHours();

      dayBookings.set(dayOfWeek, (dayBookings.get(dayOfWeek) || 0) + 1);
      hourBookings.set(hour, (hourBookings.get(hour) || 0) + 1);
    });

    const peakDaysData: PeakDayData[] = dayOfWeekNames.map((day, index) => ({
      day,
      bookings: dayBookings.get(index) || 0,
    }));

    const peakHoursData: PeakHourData[] = [];
    for (let h = 6; h <= 20; h++) {
      // Convert to 12-hour format
      const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const ampm = h < 12 ? "AM" : "PM";
      peakHoursData.push({
        hour: `${hour12}${ampm}`,
        bookings: hourBookings.get(h) || 0,
      });
    }

    // ========================================================================
    // PROVIDER PERFORMANCE TABLE
    // ========================================================================

    const providerPerformanceData: ProviderPerformanceData[] = providersWithStats
      .map((provider) => {
        const completed = provider.appointments.filter((apt) => apt.status === "COMPLETED").length;
        const cancelled = provider.appointments.filter((apt) => apt.status === "CANCELLED").length;

        // Calculate average duration in minutes
        const completedApts = provider.appointments.filter((apt) => apt.status === "COMPLETED");
        const avgDuration = completedApts.length > 0
          ? Math.round(
              completedApts.reduce((sum, apt) => {
                const duration = (new Date(apt.endTime).getTime() - new Date(apt.startTime).getTime()) / (1000 * 60);
                return sum + duration;
              }, 0) / completedApts.length
            )
          : 0;

        // Calculate average rating
        const rating = provider.reviews.length > 0
          ? Math.round((provider.reviews.reduce((sum, r) => sum + r.rating, 0) / provider.reviews.length) * 10) / 10
          : 0;

        return {
          id: provider.id,
          name: provider.healthcareName,
          avatar: provider.user?.image || undefined,
          completed,
          cancelled,
          rating,
          avgDuration,
        };
      })
      .filter((p) => p.completed > 0 || p.cancelled > 0)
      .sort((a, b) => b.completed - a.completed)
      .slice(0, 10);

    // ========================================================================
    // ACTIVE USERS LIST
    // ========================================================================

    const activeUsersData: ActiveUserData[] = usersWithAppointments.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.image || undefined,
      appointments: user.appointments.length,
      status: user.status === "ACTIVE" ? "Active" : "Inactive",
    }));

    return {
      success: true,
      data: {
        kpi: kpiData,
        serviceTrends: serviceTrendsData,
        topProviders: topProvidersData,
        topServices: topServicesData,
        peakDays: peakDaysData,
        peakHours: peakHoursData,
        providerPerformance: providerPerformanceData,
        activeUsers: activeUsersData,
      },
    };
  } catch (error) {
    console.error("Error fetching admin dashboard analytics:", error);
    return { success: false, error: "Failed to fetch admin dashboard analytics" };
  }
}

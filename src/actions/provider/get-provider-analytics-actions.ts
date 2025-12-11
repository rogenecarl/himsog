"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// ============================================================================
// TIMEZONE UTILITIES (Philippine Time - UTC+8)
// ============================================================================

/**
 * Converts a Date to Philippine timezone date string (YYYY-MM-DD)
 */
function toPhilippineDateString(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
}

/**
 * Gets the current date/time in Philippine timezone
 */
function getPhilippineNow(): Date {
  const nowStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" });
  return new Date(nowStr);
}

/**
 * Creates a Date object for the start of a day in Philippine timezone
 */
function startOfDayPH(dateString: string): Date {
  return new Date(`${dateString}T00:00:00+08:00`);
}

/**
 * Creates a Date object for the end of a day in Philippine timezone
 */
function endOfDayPH(dateString: string): Date {
  return new Date(`${dateString}T23:59:59.999+08:00`);
}

/**
 * Gets Philippine timezone hour from a Date
 */
function getPhilippineHour(date: Date): number {
  return parseInt(date.toLocaleString("en-US", { timeZone: "Asia/Manila", hour: "2-digit", hour12: false }));
}

/**
 * Gets Philippine timezone day of week (0=Sunday, 6=Saturday)
 */
function getPhilippineDayOfWeek(date: Date): number {
  const dayName = date.toLocaleDateString("en-US", { timeZone: "Asia/Manila", weekday: "short" });
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days.indexOf(dayName);
}

/**
 * Formats a date to Philippine timezone display format
 */
function formatPhilippineDate(date: Date, format: "short" | "month-day" | "month-year" | "full"): string {
  const options: Intl.DateTimeFormatOptions = { timeZone: "Asia/Manila" };

  switch (format) {
    case "short":
      return date.toLocaleDateString("en-US", { ...options, month: "short", day: "numeric" });
    case "month-day":
      return date.toLocaleDateString("en-US", { ...options, month: "short", day: "numeric" });
    case "month-year":
      return date.toLocaleDateString("en-US", { ...options, month: "short", year: "numeric" });
    case "full":
      return date.toLocaleDateString("en-US", { ...options, month: "long", day: "numeric", year: "numeric" });
    default:
      return date.toLocaleDateString("en-US", options);
  }
}

/**
 * Gets the ISO week number for a date in Philippine timezone
 */
function getPhilippineWeekNumber(date: Date): string {
  const phDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
  const firstDayOfYear = new Date(phDate.getFullYear(), 0, 1);
  const pastDaysOfYear = (phDate.getTime() - firstDayOfYear.getTime()) / 86400000;
  const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  return `${phDate.getFullYear()}-W${weekNum.toString().padStart(2, "0")}`;
}

/**
 * Gets the month key for a date in Philippine timezone
 */
function getPhilippineMonthKey(date: Date): string {
  return date.toLocaleDateString("en-US", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit" });
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface BookingHistoryEntry {
  period: string;
  label: string;
  bookings: number;
  completed: number;
  cancelled: number;
  revenue: number;
  potentialRevenue: number;
}

export interface ServiceDemandEntry {
  id: string;
  name: string;
  type: "SINGLE" | "PACKAGE";
  bookings: number;
  revenue: number;
  currentPeriodBookings: number;
  previousPeriodBookings: number;
  growthRate: number;
}

export interface PatientInsights {
  newPatients: number;
  returningPatients: number;
  newVsReturningRatio: number;
  avgBookingLeadTimeDays: number;
  peakDays: Array<{ day: string; dayIndex: number; bookings: number }>;
  noShowRate: number;
  repeatBookingRate: number;
}

export interface AnalyticsRecommendation {
  type: "staffing" | "scheduling" | "service" | "pricing" | "retention";
  title: string;
  message: string;
  priority: "high" | "medium" | "low";
  metric: string;
  actionable: string;
}

// ============================================================================
// MAIN ANALYTICS FUNCTION
// ============================================================================

export async function getProviderAnalytics(filters?: {
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

    // ========================================================================
    // DATE FILTER SETUP (Philippine Timezone)
    // ========================================================================

    let startDatePH: Date;
    let endDatePH: Date;

    if (filters?.startDate && filters?.endDate) {
      // Use provided dates with Philippine timezone
      const startStr = toPhilippineDateString(filters.startDate);
      const endStr = toPhilippineDateString(filters.endDate);
      startDatePH = startOfDayPH(startStr);
      endDatePH = endOfDayPH(endStr);
    } else {
      // Default to last 30 days in Philippine timezone
      const nowPH = getPhilippineNow();
      const thirtyDaysAgo = new Date(nowPH);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      startDatePH = startOfDayPH(toPhilippineDateString(thirtyDaysAgo));
      endDatePH = endOfDayPH(toPhilippineDateString(nowPH));
    }

    // Calculate previous period for comparison (same duration before start date)
    const periodDuration = endDatePH.getTime() - startDatePH.getTime();
    const previousStartDate = new Date(startDatePH.getTime() - periodDuration);
    const previousEndDate = new Date(startDatePH.getTime() - 1);

    // Build date filter for current period appointments
    const appointmentDateFilter: Prisma.AppointmentWhereInput = {
      providerId: provider.id,
      createdAt: {
        gte: startDatePH,
        lte: endDatePH,
      },
    };

    // Build date filter for previous period (for comparison)
    const previousPeriodFilter: Prisma.AppointmentWhereInput = {
      providerId: provider.id,
      createdAt: {
        gte: previousStartDate,
        lte: previousEndDate,
      },
    };

    // Build date filter for reviews
    const reviewDateFilter: Prisma.ReviewWhereInput = {
      providerId: provider.id,
      createdAt: {
        gte: startDatePH,
        lte: endDatePH,
      },
    };

    // ========================================================================
    // PARALLEL DATABASE QUERIES
    // ========================================================================

    const [
      // Status counts for current period
      totalBookings,
      completed,
      cancelled,
      confirmed,
      noShows,
      pending,
      // Full appointment data with service details
      appointments,
      // Previous period appointments for comparison
      previousPeriodAppointments,
      // Reviews for rating calculation
      reviews,
      // All services for the provider (to separate SINGLE vs PACKAGE)
      allServices,
      // All-time patient data for retention analysis
      allTimeAppointments,
    ] = await Promise.all([
      prisma.appointment.count({ where: appointmentDateFilter }),
      prisma.appointment.count({ where: { ...appointmentDateFilter, status: "COMPLETED" } }),
      prisma.appointment.count({ where: { ...appointmentDateFilter, status: "CANCELLED" } }),
      prisma.appointment.count({ where: { ...appointmentDateFilter, status: "CONFIRMED" } }),
      prisma.appointment.count({ where: { ...appointmentDateFilter, status: "NO_SHOW" } }),
      prisma.appointment.count({ where: { ...appointmentDateFilter, status: "PENDING" } }),
      prisma.appointment.findMany({
        where: appointmentDateFilter,
        select: {
          id: true,
          userId: true,
          status: true,
          totalPrice: true,
          startTime: true,
          createdAt: true,
          cancellationReason: true,
          services: {
            select: {
              priceAtBooking: true,
              service: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                  // Get included services for packages
                  includedServices: {
                    select: {
                      childServiceId: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.appointment.findMany({
        where: previousPeriodFilter,
        select: {
          id: true,
          services: {
            select: {
              service: {
                select: {
                  id: true,
                  type: true,
                },
              },
            },
          },
        },
      }),
      prisma.review.findMany({
        where: reviewDateFilter,
        select: {
          rating: true,
          professionalismRating: true,
          cleanlinessRating: true,
          waitTimeRating: true,
          valueRating: true,
        },
      }),
      prisma.service.findMany({
        where: { providerId: provider.id, isActive: true },
        select: {
          id: true,
          name: true,
          type: true,
          includedServices: {
            select: {
              childServiceId: true,
            },
          },
        },
      }),
      prisma.appointment.findMany({
        where: { providerId: provider.id },
        select: {
          userId: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    // ========================================================================
    // BASIC KPIs
    // ========================================================================

    const completionRate = totalBookings > 0 ? Math.round((completed / totalBookings) * 100) : 0;

    const totalRevenue = appointments
      .filter((apt) => apt.status === "COMPLETED")
      .reduce((sum, apt) => sum + Number(apt.totalPrice), 0);

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    // ========================================================================
    // BOOKING HISTORY (Daily, Weekly, Monthly) - Philippine Timezone
    // ========================================================================

    // Daily aggregation
    const dailyMap = new Map<string, BookingHistoryEntry>();

    appointments.forEach((apt) => {
      const dateKey = toPhilippineDateString(apt.createdAt);
      const label = formatPhilippineDate(apt.createdAt, "short");

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          period: dateKey,
          label,
          bookings: 0,
          completed: 0,
          cancelled: 0,
          revenue: 0,
          potentialRevenue: 0,
        });
      }

      const entry = dailyMap.get(dateKey)!;
      entry.bookings++;
      entry.potentialRevenue += Number(apt.totalPrice);
      if (apt.status === "COMPLETED") {
        entry.completed++;
        entry.revenue += Number(apt.totalPrice);
      }
      if (apt.status === "CANCELLED") entry.cancelled++;
    });

    const bookingHistoryDaily = Array.from(dailyMap.values())
      .sort((a, b) => a.period.localeCompare(b.period));

    // Weekly aggregation
    const weeklyMap = new Map<string, BookingHistoryEntry>();

    appointments.forEach((apt) => {
      const weekKey = getPhilippineWeekNumber(apt.createdAt);

      if (!weeklyMap.has(weekKey)) {
        weeklyMap.set(weekKey, {
          period: weekKey,
          label: weekKey,
          bookings: 0,
          completed: 0,
          cancelled: 0,
          revenue: 0,
          potentialRevenue: 0,
        });
      }

      const entry = weeklyMap.get(weekKey)!;
      entry.bookings++;
      entry.potentialRevenue += Number(apt.totalPrice);
      if (apt.status === "COMPLETED") {
        entry.completed++;
        entry.revenue += Number(apt.totalPrice);
      }
      if (apt.status === "CANCELLED") entry.cancelled++;
    });

    const bookingHistoryWeekly = Array.from(weeklyMap.values())
      .sort((a, b) => a.period.localeCompare(b.period));

    // Monthly aggregation
    const monthlyMap = new Map<string, BookingHistoryEntry>();

    appointments.forEach((apt) => {
      const monthKey = getPhilippineMonthKey(apt.createdAt);
      const label = formatPhilippineDate(apt.createdAt, "month-year");

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          period: monthKey,
          label,
          bookings: 0,
          completed: 0,
          cancelled: 0,
          revenue: 0,
          potentialRevenue: 0,
        });
      }

      const entry = monthlyMap.get(monthKey)!;
      entry.bookings++;
      entry.potentialRevenue += Number(apt.totalPrice);
      if (apt.status === "COMPLETED") {
        entry.completed++;
        entry.revenue += Number(apt.totalPrice);
      }
      if (apt.status === "CANCELLED") entry.cancelled++;
    });

    const bookingHistoryMonthly = Array.from(monthlyMap.values())
      .sort((a, b) => a.period.localeCompare(b.period));

    // ========================================================================
    // SERVICE DEMAND ANALYTICS (SINGLE vs PACKAGE - No Double Counting)
    // ========================================================================

    // Build a set of service IDs that are included in packages
    const servicesInPackages = new Set<string>();
    allServices.forEach((svc) => {
      if (svc.type === "PACKAGE") {
        svc.includedServices.forEach((inc) => {
          servicesInPackages.add(inc.childServiceId);
        });
      }
    });

    // Track service bookings - count each service only once per appointment
    // For packages: count the package, NOT the included services
    // For singles: only count if NOT part of a package booking in the same appointment
    const serviceStatsMap = new Map<string, {
      id: string;
      name: string;
      type: "SINGLE" | "PACKAGE";
      currentBookings: number;
      revenue: number;
    }>();

    appointments.forEach((apt) => {
      // Get all package IDs in this appointment
      const packageIdsInAppointment = new Set<string>();
      const includedServiceIdsInPackages = new Set<string>();

      apt.services.forEach((svc) => {
        if (svc.service.type === "PACKAGE") {
          packageIdsInAppointment.add(svc.service.id);
          // Mark all included services as part of a package
          svc.service.includedServices.forEach((inc) => {
            includedServiceIdsInPackages.add(inc.childServiceId);
          });
        }
      });

      apt.services.forEach((svc) => {
        const serviceId = svc.service.id;
        const serviceType = svc.service.type;

        // Skip single services that are included in a package within this appointment
        if (serviceType === "SINGLE" && includedServiceIdsInPackages.has(serviceId)) {
          return; // Don't double count
        }

        if (!serviceStatsMap.has(serviceId)) {
          serviceStatsMap.set(serviceId, {
            id: serviceId,
            name: svc.service.name,
            type: serviceType,
            currentBookings: 0,
            revenue: 0,
          });
        }

        const stats = serviceStatsMap.get(serviceId)!;
        stats.currentBookings++;
        if (apt.status === "COMPLETED") {
          stats.revenue += Number(svc.priceAtBooking);
        }
      });
    });

    // Calculate previous period bookings for each service
    const previousServiceBookings = new Map<string, number>();
    previousPeriodAppointments.forEach((apt) => {
      const packageIdsInAppointment = new Set<string>();
      const includedServiceIdsInPackages = new Set<string>();

      // First pass: identify packages
      apt.services.forEach((svc) => {
        if (svc.service.type === "PACKAGE") {
          packageIdsInAppointment.add(svc.service.id);
          // We need to find included services - check against allServices
          const fullService = allServices.find((s) => s.id === svc.service.id);
          if (fullService) {
            fullService.includedServices.forEach((inc) => {
              includedServiceIdsInPackages.add(inc.childServiceId);
            });
          }
        }
      });

      apt.services.forEach((svc) => {
        const serviceId = svc.service.id;
        const serviceType = svc.service.type;

        // Skip singles included in packages
        if (serviceType === "SINGLE" && includedServiceIdsInPackages.has(serviceId)) {
          return;
        }

        previousServiceBookings.set(
          serviceId,
          (previousServiceBookings.get(serviceId) || 0) + 1
        );
      });
    });

    // Build service demand with growth rates
    const serviceDemand: ServiceDemandEntry[] = Array.from(serviceStatsMap.values()).map((stats) => {
      const previousBookings = previousServiceBookings.get(stats.id) || 0;
      const growthRate = previousBookings > 0
        ? Math.round(((stats.currentBookings - previousBookings) / previousBookings) * 100)
        : stats.currentBookings > 0 ? 100 : 0;

      return {
        id: stats.id,
        name: stats.name,
        type: stats.type,
        bookings: stats.currentBookings,
        revenue: stats.revenue,
        currentPeriodBookings: stats.currentBookings,
        previousPeriodBookings: previousBookings,
        growthRate,
      };
    }).sort((a, b) => b.bookings - a.bookings);

    // Separate into single and package services
    const singleServicesDemand = serviceDemand.filter((s) => s.type === "SINGLE");
    const packageServicesDemand = serviceDemand.filter((s) => s.type === "PACKAGE");

    // ========================================================================
    // PATIENT INSIGHTS
    // ========================================================================

    // Track first booking date for each patient (all time)
    const patientFirstBooking = new Map<string, Date>();
    allTimeAppointments.forEach((apt) => {
      if (!patientFirstBooking.has(apt.userId)) {
        patientFirstBooking.set(apt.userId, apt.createdAt);
      }
    });

    // Count new vs returning patients in current period
    const currentPeriodPatients = new Set<string>();
    let newPatients = 0;
    let returningPatients = 0;

    appointments.forEach((apt) => {
      if (currentPeriodPatients.has(apt.userId)) return; // Already counted
      currentPeriodPatients.add(apt.userId);

      const firstBooking = patientFirstBooking.get(apt.userId);
      if (firstBooking && firstBooking >= startDatePH) {
        newPatients++;
      } else {
        returningPatients++;
      }
    });

    // Calculate average booking lead time (days between booking and appointment)
    let totalLeadTime = 0;
    let leadTimeCount = 0;

    appointments.forEach((apt) => {
      const leadTime = (apt.startTime.getTime() - apt.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      if (leadTime >= 0) {
        totalLeadTime += leadTime;
        leadTimeCount++;
      }
    });

    const avgBookingLeadTimeDays = leadTimeCount > 0 ? Math.round(totalLeadTime / leadTimeCount * 10) / 10 : 0;

    // Peak days of week (Philippine timezone)
    const dayOfWeekMap = new Map<number, number>();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    appointments.forEach((apt) => {
      const dayIndex = getPhilippineDayOfWeek(apt.startTime);
      dayOfWeekMap.set(dayIndex, (dayOfWeekMap.get(dayIndex) || 0) + 1);
    });

    const peakDays = Array.from(dayOfWeekMap.entries())
      .map(([dayIndex, bookings]) => ({
        day: dayNames[dayIndex],
        dayIndex,
        bookings,
      }))
      .sort((a, b) => b.bookings - a.bookings);

    // No-show rate
    const noShowRate = totalBookings > 0 ? Math.round((noShows / totalBookings) * 100) : 0;

    // Repeat booking rate (patients with >1 booking in period)
    const patientBookingCount = new Map<string, number>();
    appointments.forEach((apt) => {
      patientBookingCount.set(apt.userId, (patientBookingCount.get(apt.userId) || 0) + 1);
    });
    const repeatPatients = Array.from(patientBookingCount.values()).filter((count) => count > 1).length;
    const repeatBookingRate = currentPeriodPatients.size > 0
      ? Math.round((repeatPatients / currentPeriodPatients.size) * 100)
      : 0;

    const patientInsights: PatientInsights = {
      newPatients,
      returningPatients,
      newVsReturningRatio: returningPatients > 0 ? Math.round((newPatients / returningPatients) * 100) / 100 : newPatients,
      avgBookingLeadTimeDays,
      peakDays,
      noShowRate,
      repeatBookingRate,
    };

    // ========================================================================
    // RECOMMENDATIONS
    // ========================================================================

    const recommendations: AnalyticsRecommendation[] = [];

    // High no-show rate
    if (noShowRate > 10) {
      recommendations.push({
        type: "retention",
        title: "High No-Show Rate",
        message: `Your no-show rate is ${noShowRate}%. Consider implementing appointment reminders or a confirmation system.`,
        priority: noShowRate > 20 ? "high" : "medium",
        metric: `${noShowRate}% no-shows`,
        actionable: "Enable SMS/email reminders 24 hours before appointments",
      });
    }

    // Peak hours understaffing
    const peakHoursData = new Map<number, number>();
    appointments.forEach((apt) => {
      const hour = getPhilippineHour(apt.startTime);
      peakHoursData.set(hour, (peakHoursData.get(hour) || 0) + 1);
    });

    const sortedHours = Array.from(peakHoursData.entries()).sort((a, b) => b[1] - a[1]);
    if (sortedHours.length > 0) {
      const peakHour = sortedHours[0];
      const avgPerHour = totalBookings / peakHoursData.size;
      if (peakHour[1] > avgPerHour * 1.5) {
        recommendations.push({
          type: "staffing",
          title: "Peak Hour Demand",
          message: `${peakHour[0]}:00 has ${Math.round((peakHour[1] / avgPerHour - 1) * 100)}% more bookings than average. Consider adding capacity during this hour.`,
          priority: "medium",
          metric: `${peakHour[1]} bookings at ${peakHour[0]}:00`,
          actionable: "Add additional appointment slots or staff during peak hours",
        });
      }
    }

    // Growing services
    const growingServices = serviceDemand.filter((s) => s.growthRate > 30 && s.previousPeriodBookings > 0);
    if (growingServices.length > 0) {
      const topGrowing = growingServices[0];
      recommendations.push({
        type: "service",
        title: "Growing Service Demand",
        message: `"${topGrowing.name}" bookings increased by ${topGrowing.growthRate}%. Consider promoting this service or expanding capacity.`,
        priority: "low",
        metric: `+${topGrowing.growthRate}% growth`,
        actionable: "Feature this service prominently in your profile",
      });
    }

    // Low repeat booking rate
    if (repeatBookingRate < 20 && currentPeriodPatients.size > 10) {
      recommendations.push({
        type: "retention",
        title: "Low Patient Retention",
        message: `Only ${repeatBookingRate}% of patients book multiple appointments. Consider implementing a follow-up system.`,
        priority: "medium",
        metric: `${repeatBookingRate}% repeat rate`,
        actionable: "Send follow-up messages and offer loyalty incentives",
      });
    }

    // High cancellation rate
    const cancellationRate = totalBookings > 0 ? Math.round((cancelled / totalBookings) * 100) : 0;
    if (cancellationRate > 15) {
      recommendations.push({
        type: "scheduling",
        title: "High Cancellation Rate",
        message: `${cancellationRate}% of bookings are cancelled. Review your scheduling policies and booking lead times.`,
        priority: cancellationRate > 25 ? "high" : "medium",
        metric: `${cancellationRate}% cancellations`,
        actionable: "Consider requiring deposits or limiting last-minute bookings",
      });
    }

    // ========================================================================
    // EXISTING ANALYTICS (Updated with timezone-correct calculations)
    // ========================================================================

    // Appointment trends by date (Philippine timezone) - Use ISO date format for proper sorting
    const trendMap = new Map<string, { bookings: number; completed: number; cancelled: number }>();

    appointments.forEach((apt) => {
      // Use ISO date format (YYYY-MM-DD) for proper sorting and parsing
      const dateKey = toPhilippineDateString(apt.createdAt);

      if (!trendMap.has(dateKey)) {
        trendMap.set(dateKey, { bookings: 0, completed: 0, cancelled: 0 });
      }

      const trend = trendMap.get(dateKey)!;
      trend.bookings++;
      if (apt.status === "COMPLETED") trend.completed++;
      if (apt.status === "CANCELLED") trend.cancelled++;
    });

    // Sort by date chronologically
    const appointmentTrends = Array.from(trendMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, data]) => ({
        date,
        ...data,
      }));

    // Revenue by date (Philippine timezone) - Use ISO date format for proper sorting
    const revenueMap = new Map<string, { revenue: number; potential: number }>();

    appointments.forEach((apt) => {
      // Use ISO date format (YYYY-MM-DD) for proper sorting and parsing
      const dateKey = toPhilippineDateString(apt.createdAt);

      if (!revenueMap.has(dateKey)) {
        revenueMap.set(dateKey, { revenue: 0, potential: 0 });
      }

      const rev = revenueMap.get(dateKey)!;
      const price = Number(apt.totalPrice);
      rev.potential += price;
      if (apt.status === "COMPLETED") {
        rev.revenue += price;
      }
    });

    // Sort by date chronologically
    const revenueData = Array.from(revenueMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, data]) => ({
        date,
        ...data,
      }));

    // Peak hours analysis (Philippine timezone)
    const peakHours = Array.from(peakHoursData.entries())
      .map(([hour, appointments]) => ({
        hour: `${hour.toString().padStart(2, "0")}:00`,
        appointments,
      }))
      .sort((a, b) => {
        const hourA = parseInt(a.hour.split(":")[0]);
        const hourB = parseInt(b.hour.split(":")[0]);
        return hourA - hourB;
      });

    // Popular services (top 5, excluding package-included singles)
    const popularServices = serviceDemand.slice(0, 5).map((s) => ({
      name: s.name,
      bookings: s.bookings,
      type: s.type,
    }));

    // Cancellation reasons
    const cancellationMap = new Map<string, number>();

    appointments
      .filter((apt) => apt.status === "CANCELLED" && apt.cancellationReason)
      .forEach((apt) => {
        const reason = apt.cancellationReason!;
        cancellationMap.set(reason, (cancellationMap.get(reason) || 0) + 1);
      });

    const cancellationReasons = Array.from(cancellationMap.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Status distribution
    const statusData = [
      { name: "Completed", value: completed, color: "#22c55e" },
      { name: "Confirmed", value: confirmed, color: "#3b82f6" },
      { name: "Cancelled", value: cancelled, color: "#ef4444" },
      { name: "No Show", value: noShows, color: "#f97316" },
      { name: "Pending", value: pending, color: "#eab308" },
    ].filter((item) => item.value > 0);

    // Review radar data
    const reviewRadarData = reviews.length > 0 ? [
      {
        subject: "Professionalism",
        rating: reviews.reduce((sum, r) => sum + (r.professionalismRating || 0), 0) / reviews.filter(r => r.professionalismRating).length || 0,
        fullMark: 5,
      },
      {
        subject: "Cleanliness",
        rating: reviews.reduce((sum, r) => sum + (r.cleanlinessRating || 0), 0) / reviews.filter(r => r.cleanlinessRating).length || 0,
        fullMark: 5,
      },
      {
        subject: "Wait Time",
        rating: reviews.reduce((sum, r) => sum + (r.waitTimeRating || 0), 0) / reviews.filter(r => r.waitTimeRating).length || 0,
        fullMark: 5,
      },
      {
        subject: "Value",
        rating: reviews.reduce((sum, r) => sum + (r.valueRating || 0), 0) / reviews.filter(r => r.valueRating).length || 0,
        fullMark: 5,
      },
    ] : [];

    return {
      success: true,
      data: {
        // KPIs
        totalRevenue,
        totalBookings,
        avgRating: Number(avgRating.toFixed(1)),
        completionRate,
        cancellationRate: totalBookings > 0 ? Math.round((cancelled / totalBookings) * 100) : 0,
        totalPatients: newPatients + returningPatients,

        // Detailed stats
        completed,
        cancelled,
        confirmed,
        noShows,
        pending,

        // Charts data (existing)
        revenueData,
        appointmentTrends,
        peakHours,
        popularServices,
        cancellationReasons,
        statusData,
        reviewRadarData,

        // NEW: Booking History (daily, weekly, monthly)
        bookingHistory: {
          daily: bookingHistoryDaily,
          weekly: bookingHistoryWeekly,
          monthly: bookingHistoryMonthly,
        },

        // NEW: Service Demand Analytics (SINGLE vs PACKAGE)
        serviceDemand: {
          all: serviceDemand,
          single: singleServicesDemand,
          package: packageServicesDemand,
        },

        // NEW: Patient Insights
        patientInsights,

        // NEW: Recommendations
        recommendations,

        // Metadata
        dateRange: {
          start: startDatePH.toISOString(),
          end: endDatePH.toISOString(),
          timezone: "Asia/Manila",
        },
      },
    };
  } catch (error) {
    console.error("Error fetching provider analytics:", error);
    return {
      success: false,
      error: "Failed to fetch analytics",
    };
  }
}

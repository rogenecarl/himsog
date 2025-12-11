"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "../auth/auth-check-utils";
import { startOfDay, subDays, eachDayOfInterval, format } from "date-fns";

// ============================================================================
// TYPES
// ============================================================================

export interface DashboardStats {
  totalUsers: number;
  totalProviders: number;
  pendingProviders: number;
  verifiedProviders: number;
  suspendedProviders: number;
  totalCategories: number;
  totalServices: number;
  // Appointment metrics
  totalAppointments: number;
  pendingAppointments: number;
  // Review metrics
  totalReviews: number;
  averageRating: number;
  newThisWeek: {
    users: number;
    providers: number;
  };
}

export interface GrowthChartData {
  date: string;
  users: number;
  providers: number;
}

export interface ProviderStatusDistribution {
  status: string;
  count: number;
  color: string;
}

export interface PendingActionsData {
  pendingProviders: number;
  pendingDocuments: number;
  unresolvedFeedback: number;
  unreadFeedback: number;
}

// ============================================================================
// GET DASHBOARD STATS
// ============================================================================

export async function getDashboardStats() {
  try {
    await requireAdmin();

    const today = startOfDay(new Date());
    const weekAgo = subDays(today, 7);

    const [
      totalUsers,
      totalProviders,
      pendingProviders,
      verifiedProviders,
      suspendedProviders,
      totalCategories,
      totalServices,
      newUsersThisWeek,
      newProvidersThisWeek,
      // Appointment metrics
      totalAppointments,
      pendingAppointments,
      // Review metrics
      totalReviews,
      reviewStats,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.provider.count(),
      prisma.provider.count({ where: { status: "PENDING" } }),
      prisma.provider.count({ where: { status: "VERIFIED" } }),
      prisma.provider.count({ where: { status: "SUSPENDED" } }),
      prisma.category.count(),
      // Count only SINGLE and PACKAGE services, exclude services that are part of packages
      prisma.service.count({
        where: {
          type: { in: ["SINGLE", "PACKAGE"] },
          partOfPackages: { none: {} },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: weekAgo },
          role: "USER",
        },
      }),
      prisma.provider.count({
        where: { createdAt: { gte: weekAgo } },
      }),
      // Total appointments
      prisma.appointment.count(),
      // Pending appointments (upcoming, not yet confirmed or pending confirmation)
      prisma.appointment.count({
        where: {
          status: { in: ["PENDING", "CONFIRMED"] },
          startTime: { gte: new Date() },
        },
      }),
      // Total reviews
      prisma.review.count(),
      // Average rating
      prisma.review.aggregate({
        _avg: { rating: true },
      }),
    ]);

    const stats: DashboardStats = {
      totalUsers,
      totalProviders,
      pendingProviders,
      verifiedProviders,
      suspendedProviders,
      totalCategories,
      totalServices,
      totalAppointments,
      pendingAppointments,
      totalReviews,
      averageRating: reviewStats._avg.rating ?? 0,
      newThisWeek: {
        users: newUsersThisWeek,
        providers: newProvidersThisWeek,
      },
    };

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return { success: false, error: "Failed to fetch dashboard stats" };
  }
}

// ============================================================================
// GET PENDING ACTIONS
// ============================================================================

export async function getPendingActions() {
  try {
    await requireAdmin();

    const [pendingProviders, pendingDocuments, unresolvedFeedback, unreadFeedback] = await Promise.all([
      prisma.provider.count({ where: { status: "PENDING" } }),
      prisma.document.count({ where: { verificationStatus: "PENDING" } }),
      prisma.systemFeedback.count({ where: { isResolved: false } }),
      prisma.systemFeedback.count({ where: { isRead: false } }),
    ]);

    const data: PendingActionsData = {
      pendingProviders,
      pendingDocuments,
      unresolvedFeedback,
      unreadFeedback,
    };

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching pending actions:", error);
    return { success: false, error: "Failed to fetch pending actions" };
  }
}

// ============================================================================
// GET GROWTH CHART DATA
// ============================================================================

export async function getGrowthChartData(days = 30) {
  try {
    await requireAdmin();

    const endDate = new Date();
    const startDate = subDays(endDate, days);

    const dateRange = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    // Get user registrations grouped by date
    const userRegistrations = await prisma.user.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: { gte: startDate },
        role: "USER",
      },
      _count: true,
    });

    // Get provider registrations grouped by date
    const providerRegistrations = await prisma.provider.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: { gte: startDate },
      },
      _count: true,
    });

    // Create a map for quick lookup
    const userCountByDate = new Map<string, number>();
    const providerCountByDate = new Map<string, number>();

    userRegistrations.forEach((item) => {
      const dateKey = format(new Date(item.createdAt), "yyyy-MM-dd");
      userCountByDate.set(
        dateKey,
        (userCountByDate.get(dateKey) || 0) + item._count
      );
    });

    providerRegistrations.forEach((item) => {
      const dateKey = format(new Date(item.createdAt), "yyyy-MM-dd");
      providerCountByDate.set(
        dateKey,
        (providerCountByDate.get(dateKey) || 0) + item._count
      );
    });

    // Build chart data
    const chartData: GrowthChartData[] = dateRange.map((date) => {
      const dateKey = format(date, "yyyy-MM-dd");
      return {
        date: format(date, "MMM dd"),
        users: userCountByDate.get(dateKey) || 0,
        providers: providerCountByDate.get(dateKey) || 0,
      };
    });

    return { success: true, data: chartData };
  } catch (error) {
    console.error("Error fetching growth chart data:", error);
    return { success: false, error: "Failed to fetch growth chart data" };
  }
}

// ============================================================================
// GET PROVIDER STATUS DISTRIBUTION
// ============================================================================

export async function getProviderStatusDistribution() {
  try {
    await requireAdmin();

    const distribution = await prisma.provider.groupBy({
      by: ["status"],
      _count: true,
    });

    const statusColors: Record<string, string> = {
      PENDING: "#eab308", // yellow
      VERIFIED: "#22c55e", // green
      SUSPENDED: "#ef4444", // red
      REJECTED: "#6b7280", // gray
    };

    const data: ProviderStatusDistribution[] = distribution.map((item) => ({
      status: item.status,
      count: item._count,
      color: statusColors[item.status] || "#6b7280",
    }));

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching provider status distribution:", error);
    return {
      success: false,
      error: "Failed to fetch provider status distribution",
    };
  }
}

// ============================================================================
// GET CATEGORY DISTRIBUTION
// ============================================================================

export async function getCategoryDistribution() {
  try {
    await requireAdmin();

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        color: true,
        _count: {
          select: {
            providers: true,
          },
        },
      },
      orderBy: {
        providers: {
          _count: "desc",
        },
      },
      take: 10,
    });

    const data = categories.map((cat) => ({
      name: cat.name,
      count: cat._count.providers,
      color: cat.color,
    }));

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching category distribution:", error);
    return { success: false, error: "Failed to fetch category distribution" };
  }
}

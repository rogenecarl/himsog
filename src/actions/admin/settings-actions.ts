"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "../auth/auth-check-utils";
import { createAuditLog } from "./audit-actions";
import { AUDIT_ACTIONS } from "./audit-constants";

// ============================================================================
// TYPES
// ============================================================================

export interface PlatformSettings {
  siteName: string;
  siteDescription: string;
  supportEmail: string;
  allowNewRegistrations: boolean;
  requireEmailVerification: boolean;
  maintenanceMode: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: Date;
}

// ============================================================================
// HELPER - Require Admin
// ============================================================================

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized - Admin access required");
  }
  return user;
}

// ============================================================================
// GET PLATFORM SETTINGS
// ============================================================================

export async function getPlatformSettings() {
  try {
    await requireAdmin();

    // In a real app, these would come from a settings table
    // For now, return defaults that can be expanded later
    const settings: PlatformSettings = {
      siteName: "Himsog Healthcare Platform",
      siteDescription: "Find healthcare providers near you",
      supportEmail: "support@himsog.com",
      allowNewRegistrations: true,
      requireEmailVerification: true,
      maintenanceMode: false,
    };

    return { success: true, data: settings };
  } catch (error) {
    console.error("Error fetching platform settings:", error);
    return { success: false, error: "Failed to fetch settings" };
  }
}

// ============================================================================
// UPDATE PLATFORM SETTINGS
// ============================================================================

export async function updatePlatformSettings(settings: Partial<PlatformSettings>) {
  try {
    await requireAdmin();

    // In a real app, save to database
    // For now, just log the audit
    await createAuditLog({
      action: AUDIT_ACTIONS.SETTINGS_UPDATED,
      targetType: "Settings",
      targetId: "platform",
      newValue: settings,
    });

    return { success: true, message: "Settings updated successfully" };
  } catch (error) {
    console.error("Error updating platform settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}

// ============================================================================
// GET ALL ADMIN USERS
// ============================================================================

export async function getAdminUsers() {
  try {
    await requireAdmin();

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return { success: true, data: admins };
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return { success: false, error: "Failed to fetch admin users" };
  }
}

// ============================================================================
// GET SYSTEM STATISTICS
// ============================================================================

export async function getSystemStats() {
  try {
    await requireAdmin();

    const [
      totalUsers,
      totalProviders,
      totalCategories,
      totalServices,
      pendingProviders,
      auditLogsToday,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.provider.count(),
      prisma.category.count(),
      // Count only SINGLE and PACKAGE services, exclude services that are part of packages
      prisma.service.count({
        where: {
          type: { in: ["SINGLE", "PACKAGE"] },
          partOfPackages: { none: {} },
        },
      }),
      prisma.provider.count({ where: { status: "PENDING" } }),
      prisma.auditLog.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        totalUsers,
        totalProviders,
        totalCategories,
        totalServices,
        pendingProviders,
        auditLogsToday,
      },
    };
  } catch (error) {
    console.error("Error fetching system stats:", error);
    return { success: false, error: "Failed to fetch system stats" };
  }
}

// ============================================================================
// GET AUDIT LOG STATISTICS
// ============================================================================

export async function getAuditLogStats() {
  try {
    await requireAdmin();

    const [totalLogs, actionDistribution, recentAdmins] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.groupBy({
        by: ["action"],
        _count: true,
        orderBy: { _count: { action: "desc" } },
        take: 10,
      }),
      prisma.auditLog.findMany({
        distinct: ["adminId"],
        select: {
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    return {
      success: true,
      data: {
        totalLogs,
        actionDistribution: actionDistribution.map((item) => ({
          action: item.action,
          count: item._count,
        })),
        recentAdmins: recentAdmins.map((r) => r.admin),
      },
    };
  } catch (error) {
    console.error("Error fetching audit log stats:", error);
    return { success: false, error: "Failed to fetch audit log stats" };
  }
}

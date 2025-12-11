"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma";
import { getCurrentUser } from "../auth/auth-check-utils";
import { headers } from "next/headers";
import type { CreateAuditLogParams, AuditLogQueryParams } from "./audit-constants";

// Re-export types for convenience (types are allowed in "use server" files)
export type { AuditAction, AuditTargetType, CreateAuditLogParams, AuditLogQueryParams } from "./audit-constants";

// ============================================================================
// CREATE AUDIT LOG
// ============================================================================

/**
 * Create an audit log entry for admin actions
 * This function is called internally by other admin actions
 */
export async function createAuditLog(params: CreateAuditLogParams) {
  try {
    const user = await getCurrentUser();

    // Only create audit logs for admin users
    if (!user || user.role !== "ADMIN") {
      console.warn("Attempted to create audit log without admin privileges");
      return;
    }

    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    await prisma.auditLog.create({
      data: {
        adminId: user.id,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
        oldValue: params.oldValue as Prisma.InputJsonValue | undefined,
        newValue: params.newValue as Prisma.InputJsonValue | undefined,
        metadata: params.metadata as Prisma.InputJsonValue | undefined,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    // Log the error but don't throw - audit logging should not break main operations
    console.error("Failed to create audit log:", error);
  }
}

// ============================================================================
// GET AUDIT LOGS (For Admin Settings Page)
// ============================================================================

export async function getAuditLogs(params: AuditLogQueryParams = {}) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const {
      page = 1,
      limit = 20,
      action,
      targetType,
      adminId,
      startDate,
      endDate,
    } = params;

    const where = {
      ...(action && { action }),
      ...(targetType && { targetType }),
      ...(adminId && { adminId }),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate }),
            },
          }
        : {}),
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return { success: false, error: "Failed to fetch audit logs" };
  }
}

// ============================================================================
// GET RECENT ACTIVITIES (For Dashboard)
// ============================================================================

export async function getRecentActivities(limit = 10) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const activities = await prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return { success: true, data: activities };
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    return { success: false, error: "Failed to fetch activities" };
  }
}

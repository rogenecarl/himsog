"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "../auth/auth-check-utils";
import { createAuditLog } from "./audit-actions";
import { AUDIT_ACTIONS } from "./audit-constants";
import { revalidatePath } from "next/cache";
import type { UserRole, UserStatus } from "@/lib/generated/prisma";

// ============================================================================
// TYPES
// ============================================================================

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface UserListResponse {
  users: Array<{
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: UserRole;
    status: UserStatus;
    createdAt: Date;
    _count: {
      reviews: number;
    };
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// GET ALL USERS
// ============================================================================

export async function getAllUsers(params: UserQueryParams = {}) {
  try {
    await requireAdmin();

    const {
      page = 1,
      limit = 10,
      search,
      role,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(role && { role }),
      ...(status && { status }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          status: true,
          createdAt: true,
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      } as UserListResponse,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}

// ============================================================================
// GET USER BY ID
// ============================================================================

export async function getUserById(userId: string) {
  try {
    await requireAdmin();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        reviews: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
        provider: {
          select: {
            id: true,
            healthcareName: true,
            status: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            sentMessages: true,
          },
        },
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error("Error fetching user:", error);
    return { success: false, error: "Failed to fetch user" };
  }
}

// ============================================================================
// UPDATE USER ROLE
// ============================================================================

export async function updateUserRole(userId: string, newRole: UserRole) {
  try {
    const admin = await requireAdmin();

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, email: true, name: true },
    });

    if (!currentUser) {
      return { success: false, error: "User not found" };
    }

    // Prevent changing own role
    if (userId === admin.id) {
      return { success: false, error: "Cannot change your own role" };
    }

    // Prevent demoting other admins (optional security measure)
    if (currentUser.role === "ADMIN" && newRole !== "ADMIN") {
      return {
        success: false,
        error: "Cannot demote admin users. Contact system administrator.",
      };
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    await createAuditLog({
      action: AUDIT_ACTIONS.USER_ROLE_CHANGED,
      targetType: "User",
      targetId: userId,
      oldValue: { role: currentUser.role },
      newValue: { role: newRole },
      metadata: { userName: currentUser.name, userEmail: currentUser.email },
    });

    revalidatePath("/admin/user-management");
    revalidatePath("/admin/dashboard");

    return {
      success: true,
      data: user,
      message: `User role updated to ${newRole}`,
    };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: "Failed to update user role" };
  }
}

// ============================================================================
// SUSPEND USER
// ============================================================================

export async function suspendUser(userId: string, reason: string) {
  try {
    const admin = await requireAdmin();

    // Validate reason
    if (!reason || reason.trim().length < 10) {
      return {
        success: false,
        error: "Please provide a detailed reason (at least 10 characters)",
      };
    }

    // Get current user info
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, status: true, name: true, email: true },
    });

    if (!currentUser) {
      return { success: false, error: "User not found" };
    }

    // Prevent self-suspension
    if (userId === admin.id) {
      return { success: false, error: "Cannot suspend your own account" };
    }

    // Prevent suspending other admins
    if (currentUser.role === "ADMIN") {
      return {
        success: false,
        error: "Cannot suspend admin users",
      };
    }

    // Check if already suspended
    if (currentUser.status === "SUSPENDED") {
      return { success: false, error: "User is already suspended" };
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        status: "SUSPENDED",
        suspendedAt: new Date(),
        suspendReason: reason.trim(),
        suspendedById: admin.id,
      },
    });

    await createAuditLog({
      action: AUDIT_ACTIONS.USER_SUSPENDED,
      targetType: "User",
      targetId: userId,
      oldValue: { status: currentUser.status },
      newValue: { status: "SUSPENDED", reason: reason.trim() },
      metadata: { userName: currentUser.name, userEmail: currentUser.email },
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId,
        type: "ACCOUNT_SUSPENDED",
        title: "Account Suspended",
        message: `Your account has been suspended. Reason: ${reason.trim()}`,
        metadata: { reason: reason.trim() },
      },
    });

    revalidatePath("/admin/user-management");
    revalidatePath("/admin/dashboard");

    return {
      success: true,
      data: user,
      message: "User has been suspended",
    };
  } catch (error) {
    console.error("Error suspending user:", error);
    return { success: false, error: "Failed to suspend user" };
  }
}

// ============================================================================
// REACTIVATE USER
// ============================================================================

export async function reactivateUser(userId: string) {
  try {
    await requireAdmin();

    // Get current user info
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { status: true, name: true, email: true },
    });

    if (!currentUser) {
      return { success: false, error: "User not found" };
    }

    // Check if actually suspended
    if (currentUser.status !== "SUSPENDED") {
      return { success: false, error: "User is not suspended" };
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        status: "ACTIVE",
        suspendedAt: null,
        suspendReason: null,
        suspendedById: null,
      },
    });

    await createAuditLog({
      action: AUDIT_ACTIONS.USER_REACTIVATED,
      targetType: "User",
      targetId: userId,
      oldValue: { status: "SUSPENDED" },
      newValue: { status: "ACTIVE" },
      metadata: { userName: currentUser.name, userEmail: currentUser.email },
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId,
        type: "ACCOUNT_REACTIVATED",
        title: "Account Reactivated",
        message:
          "Your account has been reactivated. Welcome back! You can now use all platform features.",
      },
    });

    revalidatePath("/admin/user-management");
    revalidatePath("/admin/dashboard");

    return {
      success: true,
      data: user,
      message: "User account has been reactivated",
    };
  } catch (error) {
    console.error("Error reactivating user:", error);
    return { success: false, error: "Failed to reactivate user" };
  }
}

// ============================================================================
// DELETE USER (SOFT DELETE)
// ============================================================================

export async function deleteUser(userId: string, reason: string) {
  try {
    const admin = await requireAdmin();

    if (!reason || reason.trim().length < 10) {
      return {
        success: false,
        error: "Please provide a reason for deletion (at least 10 characters)",
      };
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, status: true, name: true, email: true },
    });

    if (!currentUser) {
      return { success: false, error: "User not found" };
    }

    // Prevent self-deletion
    if (userId === admin.id) {
      return { success: false, error: "Cannot delete your own account" };
    }

    // Prevent deleting admins
    if (currentUser.role === "ADMIN") {
      return { success: false, error: "Cannot delete admin users" };
    }

    // Soft delete - mark as deleted
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        status: "DELETED",
        suspendedAt: new Date(),
        suspendReason: `Account deleted: ${reason.trim()}`,
        suspendedById: admin.id,
      },
    });

    await createAuditLog({
      action: AUDIT_ACTIONS.USER_DELETED,
      targetType: "User",
      targetId: userId,
      oldValue: { status: currentUser.status },
      newValue: { status: "DELETED", reason: reason.trim() },
      metadata: { userName: currentUser.name, userEmail: currentUser.email },
    });

    revalidatePath("/admin/user-management");
    revalidatePath("/admin/dashboard");

    return {
      success: true,
      data: user,
      message: "User account has been deleted",
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Failed to delete user" };
  }
}

// ============================================================================
// GET USER STATISTICS
// ============================================================================

export async function getUserStatistics() {
  try {
    await requireAdmin();

    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      deletedUsers,
      usersByRole,
      newUsersThisWeek,
      newUsersThisMonth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { status: "SUSPENDED" } }),
      prisma.user.count({ where: { status: "DELETED" } }),
      prisma.user.groupBy({
        by: ["role"],
        _count: true,
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    const roleDistribution = usersByRole.reduce(
      (acc, item) => {
        acc[item.role] = item._count;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      success: true,
      data: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        deletedUsers,
        roleDistribution,
        newUsersThisWeek,
        newUsersThisMonth,
      },
    };
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    return { success: false, error: "Failed to fetch user statistics" };
  }
}

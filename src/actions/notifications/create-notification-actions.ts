"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// ============================================================================
// TYPES
// ============================================================================

export interface NotificationData {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  appointmentId: string | null;
  providerId: string | null;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  appointment?: {
    id: string;
    appointmentNumber: string;
    totalPrice: number;
    provider: {
      healthcareName: string;
      coverPhoto: string | null;
    };
  } | null;
  provider?: {
    healthcareName: string;
    coverPhoto: string | null;
  } | null;
}

export interface NotificationsResponse {
  notifications: NotificationData[];
  unreadCount: number;
}

// ============================================================================
// HELPER - Get authenticated user
// ============================================================================

async function getAuthenticatedUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user ?? null;
}

// ============================================================================
// GET NOTIFICATIONS WITH COUNT (Combined - Single API call)
// ============================================================================

export async function getNotificationsWithCount(): Promise<{
  success: boolean;
  data?: NotificationsResponse;
  error?: string;
}> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Run both queries in parallel for better performance
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          userId: true,
          type: true,
          title: true,
          message: true,
          isRead: true,
          appointmentId: true,
          providerId: true,
          readAt: true,
          createdAt: true,
          updatedAt: true,
          appointment: {
            select: {
              id: true,
              appointmentNumber: true,
              totalPrice: true,
              provider: {
                select: {
                  healthcareName: true,
                  coverPhoto: true,
                },
              },
            },
          },
          provider: {
            select: {
              healthcareName: true,
              coverPhoto: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.notification.count({
        where: { userId: user.id, isRead: false },
      }),
    ]);

    // Serialize Decimal fields
    const serializedNotifications: NotificationData[] = notifications.map(
      (notification) => ({
        ...notification,
        appointment: notification.appointment
          ? {
              ...notification.appointment,
              totalPrice: Number(notification.appointment.totalPrice),
            }
          : null,
      })
    );

    return {
      success: true,
      data: {
        notifications: serializedNotifications,
        unreadCount,
      },
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch notifications",
    };
  }
}

// ============================================================================
// GET USER NOTIFICATIONS (Legacy - kept for compatibility)
// ============================================================================

export async function getUserNotifications() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        userId: true,
        type: true,
        title: true,
        message: true,
        isRead: true,
        appointmentId: true,
        providerId: true,
        readAt: true,
        createdAt: true,
        updatedAt: true,
        appointment: {
          select: {
            id: true,
            appointmentNumber: true,
            totalPrice: true,
            provider: {
              select: {
                healthcareName: true,
                coverPhoto: true,
              },
            },
          },
        },
        provider: {
          select: {
            healthcareName: true,
            coverPhoto: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const serializedNotifications = notifications.map((notification) => ({
      ...notification,
      appointment: notification.appointment
        ? {
            ...notification.appointment,
            totalPrice: Number(notification.appointment.totalPrice),
          }
        : null,
    }));

    return { success: true, data: serializedNotifications };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch notifications",
    };
  }
}

// ============================================================================
// GET UNREAD COUNT (Legacy - kept for compatibility)
// ============================================================================

export async function getUnreadNotificationCount() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "Not authenticated", count: 0 };
    }

    const count = await prisma.notification.count({
      where: { userId: user.id, isRead: false },
    });

    return { success: true, count };
  } catch (error) {
    console.error("Error counting notifications:", error);
    return { success: false, error: "Failed to count notifications", count: 0 };
  }
}

// ============================================================================
// MARK NOTIFICATION AS READ
// ============================================================================

export async function markNotificationAsRead(notificationId: string) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    await prisma.notification.update({
      where: { id: notificationId, userId: user.id },
      data: { isRead: true, readAt: new Date() },
    });

    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to mark notification as read",
    };
  }
}

// ============================================================================
// MARK ALL NOTIFICATIONS AS READ
// ============================================================================

export async function markAllNotificationsAsRead() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return { success: true };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to mark all notifications as read",
    };
  }
}

// ============================================================================
// DELETE NOTIFICATION
// ============================================================================

export async function deleteNotification(notificationId: string) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    await prisma.notification.delete({
      where: { id: notificationId, userId: user.id },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete notification",
    };
  }
}

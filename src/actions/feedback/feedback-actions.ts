"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { FeedbackCategory, FeedbackPriority } from "@/lib/generated/prisma";

// Schema for submitting feedback
const SubmitFeedbackSchema = z.object({
  category: z.nativeEnum(FeedbackCategory),
  priority: z.nativeEnum(FeedbackPriority).optional(),
  title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title too long"),
  message: z.string().min(20, "Please provide more details (at least 20 characters)").max(2000, "Message too long"),
  satisfactionRating: z.number().min(1).max(5).optional(),
});

export type SubmitFeedbackInput = z.infer<typeof SubmitFeedbackSchema>;

export async function submitFeedback(data: SubmitFeedbackInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in to submit feedback",
      };
    }

    const validatedData = SubmitFeedbackSchema.parse(data);

    const feedback = await prisma.systemFeedback.create({
      data: {
        userId: session.user.id,
        category: validatedData.category,
        priority: validatedData.priority || FeedbackPriority.MEDIUM,
        title: validatedData.title,
        message: validatedData.message,
        satisfactionRating: validatedData.satisfactionRating,
      },
    });

    return {
      success: true,
      data: feedback,
      message: "Thank you for your feedback! We appreciate your input.",
    };
  } catch (error) {
    console.error("Error submitting feedback:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }

    return {
      success: false,
      error: "Failed to submit feedback. Please try again.",
    };
  }
}

// Get user's submitted feedback
export async function getUserFeedback() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in",
        data: [],
      };
    }

    const feedback = await prisma.systemFeedback.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    return {
      success: true,
      data: feedback,
    };
  } catch (error) {
    console.error("Error fetching user feedback:", error);
    return {
      success: false,
      error: "Failed to fetch feedback",
      data: [],
    };
  }
}

// Admin: Get all feedback with pagination
export async function getAllFeedback(filters?: {
  category?: FeedbackCategory;
  isRead?: boolean;
  isResolved?: boolean;
  page?: number;
  limit?: number;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized",
        data: [],
        pagination: null,
      };
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: {
      category?: FeedbackCategory;
      isRead?: boolean;
      isResolved?: boolean;
    } = {};

    if (filters?.category) where.category = filters.category;
    if (filters?.isRead !== undefined) where.isRead = filters.isRead;
    if (filters?.isResolved !== undefined) where.isResolved = filters.isResolved;

    // Fetch feedback and count in parallel
    const [feedback, total] = await Promise.all([
      prisma.systemFeedback.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.systemFeedback.count({ where }),
    ]);

    return {
      success: true,
      data: feedback,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + feedback.length < total,
      },
    };
  } catch (error) {
    console.error("Error fetching all feedback:", error);
    return {
      success: false,
      error: "Failed to fetch feedback",
      data: [],
      pagination: null,
    };
  }
}

// Admin: Get feedback statistics for dashboard (optimized with single-pass aggregation)
export async function getFeedbackStatistics() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized",
        data: null,
      };
    }

    // Get all feedback for statistics
    const allFeedback = await prisma.systemFeedback.findMany({
      select: {
        id: true,
        category: true,
        priority: true,
        satisfactionRating: true,
        isRead: true,
        isResolved: true,
        createdAt: true,
      },
    });

    // Calculate 30 days ago for trend filtering
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // OPTIMIZED: Single-pass aggregation instead of multiple filter loops
    const stats = allFeedback.reduce(
      (acc, f) => {
        // Count unread and resolved
        if (!f.isRead) acc.unread++;
        if (f.isResolved) acc.resolved++;

        // Category counts
        acc.categoryCount[f.category] = (acc.categoryCount[f.category] || 0) + 1;

        // Priority counts
        if (f.priority) {
          acc.priorityCount[f.priority] = (acc.priorityCount[f.priority] || 0) + 1;
        }

        // Satisfaction rating aggregation
        if (f.satisfactionRating !== null) {
          acc.satisfactionSum += f.satisfactionRating;
          acc.satisfactionCount++;
          acc.satisfactionDist[f.satisfactionRating] =
            (acc.satisfactionDist[f.satisfactionRating] || 0) + 1;
        }

        // Date trend (last 30 days)
        if (f.createdAt >= thirtyDaysAgo) {
          const dateKey = f.createdAt.toISOString().split("T")[0];
          acc.dateCount[dateKey] = (acc.dateCount[dateKey] || 0) + 1;
        }

        return acc;
      },
      {
        unread: 0,
        resolved: 0,
        categoryCount: {} as Record<string, number>,
        priorityCount: {} as Record<string, number>,
        satisfactionSum: 0,
        satisfactionCount: 0,
        satisfactionDist: {} as Record<number, number>,
        dateCount: {} as Record<string, number>,
      }
    );

    const total = allFeedback.length;
    const pending = total - stats.resolved;

    // Build category breakdown from aggregated data
    const categoryBreakdown = Object.values(FeedbackCategory).map((category) => ({
      category,
      count: stats.categoryCount[category] || 0,
    }));

    // Build priority breakdown from aggregated data
    const priorityBreakdown = Object.values(FeedbackPriority).map((priority) => ({
      priority,
      count: stats.priorityCount[priority] || 0,
    }));

    // Calculate average satisfaction
    const avgSatisfaction =
      stats.satisfactionCount > 0
        ? stats.satisfactionSum / stats.satisfactionCount
        : 0;

    // Build satisfaction distribution from aggregated data
    const satisfactionDistribution = [1, 2, 3, 4, 5].map((rating) => ({
      rating,
      count: stats.satisfactionDist[rating] || 0,
    }));

    // Fill in missing dates with 0 for trend chart
    const feedbackTrend: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];
      feedbackTrend.push({
        date: dateKey,
        count: stats.dateCount[dateKey] || 0,
      });
    }

    // Resolution rate
    const resolutionRate = total > 0 ? (stats.resolved / total) * 100 : 0;

    return {
      success: true,
      data: {
        total,
        unread: stats.unread,
        resolved: stats.resolved,
        pending,
        avgSatisfaction: Math.round(avgSatisfaction * 10) / 10,
        resolutionRate: Math.round(resolutionRate),
        categoryBreakdown,
        priorityBreakdown,
        satisfactionDistribution,
        feedbackTrend,
      },
    };
  } catch (error) {
    console.error("Error fetching feedback statistics:", error);
    return {
      success: false,
      error: "Failed to fetch statistics",
      data: null,
    };
  }
}

// Admin: Mark feedback as read
export async function markFeedbackAsRead(feedbackId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    await prisma.systemFeedback.update({
      where: { id: feedbackId },
      data: { isRead: true },
    });

    revalidatePath("/admin/feedback");

    return {
      success: true,
      message: "Marked as read",
    };
  } catch (error) {
    console.error("Error marking feedback as read:", error);
    return {
      success: false,
      error: "Failed to mark as read",
    };
  }
}

// Admin: Toggle resolved status
export async function toggleFeedbackResolved(feedbackId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const feedback = await prisma.systemFeedback.findUnique({
      where: { id: feedbackId },
      select: { isResolved: true },
    });

    if (!feedback) {
      return {
        success: false,
        error: "Feedback not found",
      };
    }

    await prisma.systemFeedback.update({
      where: { id: feedbackId },
      data: {
        isResolved: !feedback.isResolved,
        resolvedAt: !feedback.isResolved ? new Date() : null,
        isRead: true,
      },
    });

    revalidatePath("/admin/feedback");

    return {
      success: true,
      message: feedback.isResolved ? "Marked as unresolved" : "Marked as resolved",
    };
  } catch (error) {
    console.error("Error toggling feedback resolved status:", error);
    return {
      success: false,
      error: "Failed to update status",
    };
  }
}

// Admin: Respond to feedback
export async function respondToFeedback(
  feedbackId: string,
  response: string,
  markResolved: boolean = false
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const feedback = await prisma.systemFeedback.update({
      where: { id: feedbackId },
      data: {
        adminResponse: response,
        respondedAt: new Date(),
        respondedById: session.user.id,
        isRead: true,
        ...(markResolved
          ? {
              isResolved: true,
              resolvedAt: new Date(),
            }
          : {}),
      },
    });

    revalidatePath("/admin/feedback");

    return {
      success: true,
      data: feedback,
      message: "Response sent successfully",
    };
  } catch (error) {
    console.error("Error responding to feedback:", error);
    return {
      success: false,
      error: "Failed to respond to feedback",
    };
  }
}

"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  CreateReviewInput,
  CreateReviewSchema,
  UpdateReviewInput,
  UpdateReviewSchema,
  ProviderResponseInput,
  ProviderResponseSchema,
  GetProviderReviewsInput,
  GetProviderReviewsSchema,
  ToggleReviewLikeInput,
  ToggleReviewLikeSchema,
  type ProviderRatingStats,
} from "@/schemas/review.schema";
import { differenceInDays } from "date-fns";

// ============================================================================
// CREATE REVIEW
// ============================================================================

export async function createReview(data: CreateReviewInput) {
  try {
    // Validate input
    const validatedData = CreateReviewSchema.parse(data);

    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "You must be logged in to leave a review" };
    }

    // Check if user can review this appointment
    const canReview = await canUserReview(validatedData.appointmentId);
    
    if (!canReview.success) {
      return { success: false, error: canReview.error };
    }

    // Get appointment details
    const appointment = await prisma.appointment.findUnique({
      where: { id: validatedData.appointmentId },
      select: {
        id: true,
        userId: true,
        providerId: true,
        status: true,
        endTime: true,
      },
    });

    if (!appointment) {
      return { success: false, error: "Appointment not found" };
    }

    // Verify user owns this appointment
    if (appointment.userId !== session.user.id) {
      return { success: false, error: "You can only review your own appointments" };
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        appointmentId: validatedData.appointmentId,
        userId: session.user.id,
        providerId: appointment.providerId,
        rating: validatedData.rating,
        comment: validatedData.comment || null,
        isAnonymous: validatedData.isAnonymous ?? false,
        professionalismRating: validatedData.professionalismRating || null,
        cleanlinessRating: validatedData.cleanlinessRating || null,
        waitTimeRating: validatedData.waitTimeRating || null,
        valueRating: validatedData.valueRating || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        provider: {
          select: {
            id: true,
            healthcareName: true,
            userId: true,
          },
        },
      },
    });

    // Create notification for provider
    await prisma.notification.create({
      data: {
        userId: review.provider.userId,
        type: "REVIEW_RECEIVED",
        title: "New Review Received",
        message: `${review.user.name} left a ${review.rating}-star review for ${review.provider.healthcareName}`,
        providerId: review.providerId,
      },
    });

    // Revalidate relevant paths
    revalidatePath(`/provider-details/${appointment.providerId}`);
    revalidatePath("/appointments");

    return { 
      success: true, 
      data: review,
      message: "Review submitted successfully" 
    };
  } catch (error) {
    console.error("Error creating review:", error);
    
    // Handle Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      const zodError = error as { issues: Array<{ message?: string }> };
      const firstIssue = zodError.issues?.[0];
      if (firstIssue) {
        return {
          success: false,
          error: firstIssue.message || "Validation error"
        };
      }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create review" 
    };
  }
}

// ============================================================================
// CHECK IF USER CAN REVIEW
// ============================================================================

export async function canUserReview(appointmentId: string) {
  try {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "You must be logged in" };
    }

    // Get appointment with review
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        review: true,
      },
    });

    if (!appointment) {
      return { success: false, error: "Appointment not found" };
    }

    // Check if user owns this appointment
    if (appointment.userId !== session.user.id) {
      return { success: false, error: "You can only review your own appointments" };
    }

    // Check if appointment is completed
    if (appointment.status !== "COMPLETED") {
      return { success: false, error: "You can only review completed appointments" };
    }

    // Check if appointment end time has passed
    const now = new Date();
    if (appointment.endTime > now) {
      return { success: false, error: "You can review after the appointment is completed" };
    }

    // Check if already reviewed
    if (appointment.review) {
      return { success: false, error: "You have already reviewed this appointment" };
    }

    // Check if within review window (30 days)
    const daysSinceCompletion = differenceInDays(now, appointment.endTime);
    if (daysSinceCompletion > 30) {
      return { success: false, error: "Review period has expired (30 days after completion)" };
    }

    return { success: true, canReview: true };
  } catch (error) {
    console.error("Error checking review eligibility:", error);
    return { 
      success: false, 
      error: "Failed to check review eligibility" 
    };
  }
}

// ============================================================================
// UPDATE REVIEW (within 7 days)
// ============================================================================

export async function updateReview(data: UpdateReviewInput) {
  try {
    // Validate input
    const validatedData = UpdateReviewSchema.parse(data);

    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "You must be logged in" };
    }

    // Get existing review
    const existingReview = await prisma.review.findUnique({
      where: { id: validatedData.reviewId },
      include: {
        appointment: {
          select: {
            providerId: true,
          },
        },
      },
    });

    if (!existingReview) {
      return { success: false, error: "Review not found" };
    }

    // Check ownership
    if (existingReview.userId !== session.user.id) {
      return { success: false, error: "You can only edit your own reviews" };
    }

    // Check if within edit window (7 days)
    const daysSinceCreation = differenceInDays(new Date(), existingReview.createdAt);
    if (daysSinceCreation > 7) {
      return { success: false, error: "Reviews can only be edited within 7 days of creation" };
    }

    // Update the review
    const updatedReview = await prisma.review.update({
      where: { id: validatedData.reviewId },
      data: {
        rating: validatedData.rating ?? existingReview.rating,
        comment: validatedData.comment !== undefined ? validatedData.comment : existingReview.comment,
        professionalismRating: validatedData.professionalismRating !== undefined 
          ? validatedData.professionalismRating 
          : existingReview.professionalismRating,
        cleanlinessRating: validatedData.cleanlinessRating !== undefined 
          ? validatedData.cleanlinessRating 
          : existingReview.cleanlinessRating,
        waitTimeRating: validatedData.waitTimeRating !== undefined 
          ? validatedData.waitTimeRating 
          : existingReview.waitTimeRating,
        valueRating: validatedData.valueRating !== undefined 
          ? validatedData.valueRating 
          : existingReview.valueRating,
        isEdited: true,
        editedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Revalidate paths
    revalidatePath(`/provider-details/${existingReview.appointment.providerId}`);
    revalidatePath("/appointments");

    return { 
      success: true, 
      data: updatedReview,
      message: "Review updated successfully" 
    };
  } catch (error) {
    console.error("Error updating review:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update review" 
    };
  }
}

// ============================================================================
// GET PROVIDER REVIEWS
// ============================================================================

export async function getProviderReviews(input: GetProviderReviewsInput) {
  try {
    const validatedInput = GetProviderReviewsSchema.parse(input);
    const { providerId, page, limit, sortBy, sortOrder, minRating } = validatedInput;

    const skip = (page - 1) * limit;

    // Get current session to check if user has liked reviews
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const currentUserId = session?.user?.id;

    // Build where clause
    const where: Prisma.ReviewWhereInput = {
      providerId,
    };

    if (minRating) {
      where.rating = { gte: minRating };
    }

    // Get reviews with pagination
    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where,
        select: {
          id: true,
          rating: true,
          comment: true,
          isAnonymous: true,
          createdAt: true,
          isEdited: true,
          providerResponse: true,
          respondedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              likes: true,
            },
          },
          likes: currentUserId
            ? {
                where: {
                  userId: currentUserId,
                },
                select: {
                  id: true,
                },
              }
            : false,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    // Transform reviews to include likeCount and hasLiked
    const transformedReviews = reviews.map((review) => ({
      ...review,
      likeCount: review._count.likes,
      hasLiked: currentUserId ? review.likes && review.likes.length > 0 : false,
      _count: undefined,
      likes: undefined,
    }));

    return {
      success: true,
      data: {
        reviews: transformedReviews,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    };
  } catch (error) {
    console.error("Error fetching provider reviews:", error);
    return {
      success: false,
      error: "Failed to fetch reviews",
    };
  }
}

// ============================================================================
// GET PROVIDER RATING STATS
// ============================================================================

export async function getProviderRatingStats(providerId: string): Promise<ProviderRatingStats | null> {
  try {
    const reviews = await prisma.review.findMany({
      where: { providerId },
      select: {
        rating: true,
      },
    });

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    // Calculate rating distribution
    const ratingDistribution = reviews.reduce(
      (acc, review) => {
        acc[review.rating as keyof typeof acc]++;
        return acc;
      },
      { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    );

    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: reviews.length,
      ratingDistribution,
    };
  } catch (error) {
    console.error("Error fetching provider rating stats:", error);
    return null;
  }
}

// ============================================================================
// GET USER REVIEWS
// ============================================================================

export async function getUserReviews(userId?: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "You must be logged in" };
    }

    const targetUserId = userId || session.user.id;

    // Only allow users to see their own reviews
    if (targetUserId !== session.user.id) {
      return { success: false, error: "You can only view your own reviews" };
    }

    const reviews = await prisma.review.findMany({
      where: { userId: targetUserId },
      include: {
        provider: {
          select: {
            id: true,
            healthcareName: true,
            coverPhoto: true,
            city: true,
          },
        },
        appointment: {
          select: {
            id: true,
            appointmentNumber: true,
            startTime: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      data: reviews,
    };
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    return {
      success: false,
      error: "Failed to fetch reviews",
    };
  }
}

// ============================================================================
// PROVIDER RESPONSE TO REVIEW
// ============================================================================

export async function addProviderResponse(data: ProviderResponseInput) {
  try {
    const validatedData = ProviderResponseSchema.parse(data);

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "You must be logged in" };
    }

    // Get review with provider info
    const review = await prisma.review.findUnique({
      where: { id: validatedData.reviewId },
      include: {
        provider: {
          select: {
            userId: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!review) {
      return { success: false, error: "Review not found" };
    }

    // Check if user is the provider
    if (review.provider.userId !== session.user.id) {
      return { success: false, error: "You can only respond to reviews for your own provider profile" };
    }

    // Check if already responded
    if (review.providerResponse) {
      return { success: false, error: "You have already responded to this review" };
    }

    // Add response
    const updatedReview = await prisma.review.update({
      where: { id: validatedData.reviewId },
      data: {
        providerResponse: validatedData.response,
        respondedAt: new Date(),
      },
    });

    // Notify the user who wrote the review
    await prisma.notification.create({
      data: {
        userId: review.userId,
        type: "REVIEW_RESPONSE",
        title: "Provider Responded to Your Review",
        message: `${review.provider.userId} responded to your review`,
        providerId: review.providerId,
      },
    });

    revalidatePath(`/provider-details/${review.providerId}`);

    return {
      success: true,
      data: updatedReview,
      message: "Response added successfully",
    };
  } catch (error) {
    console.error("Error adding provider response:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add response",
    };
  }
}

// ============================================================================
// TOGGLE REVIEW LIKE
// ============================================================================

export async function toggleReviewLike(data: ToggleReviewLikeInput) {
  try {
    const validatedData = ToggleReviewLikeSchema.parse(data);

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "You must be logged in to like reviews" };
    }

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: validatedData.reviewId },
      select: { id: true, providerId: true },
    });

    if (!review) {
      return { success: false, error: "Review not found" };
    }

    // Check if user already liked this review
    const existingLike = await prisma.reviewLike.findUnique({
      where: {
        reviewId_userId: {
          reviewId: validatedData.reviewId,
          userId: session.user.id,
        },
      },
    });

    if (existingLike) {
      // Unlike - remove the like
      await prisma.reviewLike.delete({
        where: { id: existingLike.id },
      });

      return {
        success: true,
        data: { liked: false },
        message: "Review unliked",
      };
    } else {
      // Like - create new like
      await prisma.reviewLike.create({
        data: {
          reviewId: validatedData.reviewId,
          userId: session.user.id,
        },
      });

      return {
        success: true,
        data: { liked: true },
        message: "Review liked",
      };
    }
  } catch (error) {
    console.error("Error toggling review like:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle like",
    };
  }
}

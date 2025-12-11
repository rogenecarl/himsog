// src/schemas/review.schema.ts

import { z } from 'zod';

// ============================================================================
// BASE REVIEW SCHEMA
// ============================================================================
export const ReviewSchema = z.object({
  id: z.string().uuid({ message: "Invalid UUID" }),
  appointmentId: z.string().uuid({ message: "Invalid appointment UUID" }),
  userId: z.string().uuid({ message: "Invalid user UUID" }),
  providerId: z.string().uuid({ message: "Invalid provider UUID" }),
  
  // Rating fields
  rating: z.number().int().min(1).max(5, { message: "Rating must be between 1 and 5" }),
  comment: z.string().nullable(),
  
  // Optional category ratings
  professionalismRating: z.number().int().min(1).max(5).nullable(),
  cleanlinessRating: z.number().int().min(1).max(5).nullable(),
  waitTimeRating: z.number().int().min(1).max(5).nullable(),
  valueRating: z.number().int().min(1).max(5).nullable(),
  
  // Provider response
  providerResponse: z.string().nullable(),
  respondedAt: z.date().nullable(),
  
  // Metadata
  isEdited: z.boolean().default(false),
  editedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ============================================================================
// FORM VALIDATION SCHEMAS
// ============================================================================

// Schema for creating a new review
export const CreateReviewSchema = z.object({
  appointmentId: z.string().uuid({ message: "Invalid appointment UUID" }),
  rating: z.number()
    .int({ message: "Rating must be a whole number" })
    .min(1, { message: "Rating must be at least 1 star" })
    .max(5, { message: "Rating cannot exceed 5 stars" }),
  comment: z.string()
    .max(1000, { message: "Review must be less than 1000 characters" })
    .refine((val) => !val || val.length === 0 || val.length >= 10, {
      message: "Review must be at least 10 characters if provided"
    })
    .optional()
    .nullable(),
  isAnonymous: z.boolean().default(false),
  
  // Optional category ratings
  professionalismRating: z.number().int().min(1).max(5).optional().nullable(),
  cleanlinessRating: z.number().int().min(1).max(5).optional().nullable(),
  waitTimeRating: z.number().int().min(1).max(5).optional().nullable(),
  valueRating: z.number().int().min(1).max(5).optional().nullable(),
});

// Schema for updating a review (within 7 days)
export const UpdateReviewSchema = z.object({
  reviewId: z.string().uuid({ message: "Invalid review UUID" }),
  rating: z.number()
    .int({ message: "Rating must be a whole number" })
    .min(1, { message: "Rating must be at least 1 star" })
    .max(5, { message: "Rating cannot exceed 5 stars" })
    .optional(),
  comment: z.string()
    .min(10, { message: "Review must be at least 10 characters" })
    .max(1000, { message: "Review must be less than 1000 characters" })
    .optional()
    .nullable(),
  
  // Optional category ratings
  professionalismRating: z.number().int().min(1).max(5).optional().nullable(),
  cleanlinessRating: z.number().int().min(1).max(5).optional().nullable(),
  waitTimeRating: z.number().int().min(1).max(5).optional().nullable(),
  valueRating: z.number().int().min(1).max(5).optional().nullable(),
});

// Schema for provider response to review
export const ProviderResponseSchema = z.object({
  reviewId: z.string().uuid({ message: "Invalid review UUID" }),
  response: z.string()
    .min(10, { message: "Response must be at least 10 characters" })
    .max(500, { message: "Response must be less than 500 characters" }),
});

// Schema for checking if user can review
export const CanReviewSchema = z.object({
  appointmentId: z.string().uuid({ message: "Invalid appointment UUID" }),
});

// Schema for fetching provider reviews
export const GetProviderReviewsSchema = z.object({
  providerId: z.string().uuid({ message: "Invalid provider UUID" }),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(10),
  sortBy: z.enum(['createdAt', 'rating']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  minRating: z.number().int().min(1).max(5).optional(),
});

// Schema for liking/unliking a review
export const ToggleReviewLikeSchema = z.object({
  reviewId: z.string().uuid({ message: "Invalid review UUID" }),
});

// ============================================================================
// INFERRED TYPESCRIPT TYPES
// ============================================================================

export type Review = z.infer<typeof ReviewSchema>;
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
export type UpdateReviewInput = z.infer<typeof UpdateReviewSchema>;
export type ProviderResponseInput = z.infer<typeof ProviderResponseSchema>;
export type CanReviewInput = z.infer<typeof CanReviewSchema>;
export type GetProviderReviewsInput = z.infer<typeof GetProviderReviewsSchema>;
export type ToggleReviewLikeInput = z.infer<typeof ToggleReviewLikeSchema>;

// ============================================================================
// RELATIONAL TYPES
// ============================================================================

import type { User } from './user.schema';
import type { Provider } from './provider.schema';

export type ReviewWithUser = Review & {
  user: Pick<User, 'id' | 'name' | 'image'>;
};

export type ReviewWithProvider = Review & {
  provider: Pick<Provider, 'id' | 'healthcareName'>;
};

export type ReviewWithRelations = Review & {
  user: Pick<User, 'id' | 'name' | 'image'>;
  provider: Pick<Provider, 'id' | 'healthcareName'>;
};

// For review statistics
export type ProviderRatingStats = {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
};

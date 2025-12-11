import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProviderReviews,
  getProviderRatingStats,
  createReview,
  addProviderResponse,
  canUserReview,
  getUserReviews,
  updateReview,
  toggleReviewLike
} from '@/actions/review/review-actions';
import type {
  CreateReviewInput,
  UpdateReviewInput,
  ProviderResponseInput,
  GetProviderReviewsInput,
  ToggleReviewLikeInput
} from '@/schemas/review.schema';

// Type for review cache data used in optimistic updates
interface ReviewCacheItem {
  id: string;
  rating: number;
  comment: string | null;
  isAnonymous: boolean;
  createdAt: Date;
  isEdited: boolean;
  providerResponse: string | null;
  respondedAt: Date | null;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
  likeCount: number;
  hasLiked: boolean;
}

interface ReviewCacheData {
  reviews: ReviewCacheItem[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

// Query keys for cache management
export const reviewKeys = {
  all: ['reviews'] as const,
  provider: (providerId: string) => [...reviewKeys.all, 'provider', providerId] as const,
  providerWithPage: (providerId: string, page: number) => [...reviewKeys.provider(providerId), page] as const,
  stats: (providerId: string) => [...reviewKeys.all, 'stats', providerId] as const,
  user: (userId?: string) => [...reviewKeys.all, 'user', userId] as const,
  canReview: (appointmentId: string) => [...reviewKeys.all, 'canReview', appointmentId] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Fetch provider reviews with pagination
 */
export function useProviderReviews(input: GetProviderReviewsInput) {
  return useQuery({
    queryKey: reviewKeys.providerWithPage(input.providerId, input.page),
    queryFn: async () => {
      const result = await getProviderReviews(input);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch reviews');
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch provider rating statistics
 */
export function useProviderStats(providerId: string) {
  return useQuery({
    queryKey: reviewKeys.stats(providerId),
    queryFn: async () => {
      const stats = await getProviderRatingStats(providerId);
      if (!stats) {
        throw new Error('Failed to fetch rating stats');
      }
      return stats;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Check if user can review an appointment
 */
export function useCanReview(appointmentId: string) {
  return useQuery({
    queryKey: reviewKeys.canReview(appointmentId),
    queryFn: async () => {
      const result = await canUserReview(appointmentId);
      return result;
    },
    enabled: !!appointmentId,
  });
}

/**
 * Fetch user's reviews
 */
export function useUserReviews(userId?: string) {
  return useQuery({
    queryKey: reviewKeys.user(userId),
    queryFn: async () => {
      const result = await getUserReviews(userId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch user reviews');
      }
      return result.data;
    },
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new review
 */
export function useCreateReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateReviewInput) => createReview(data),
    onSuccess: (result, variables) => {
      if (result.success && result.data) {
        // Invalidate provider reviews and stats using the providerId from the result
        queryClient.invalidateQueries({ 
          queryKey: reviewKeys.provider(result.data.providerId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: reviewKeys.stats(result.data.providerId) 
        });
        // Invalidate user reviews
        queryClient.invalidateQueries({ 
          queryKey: reviewKeys.user() 
        });
        // Invalidate can review check
        queryClient.invalidateQueries({ 
          queryKey: reviewKeys.canReview(variables.appointmentId) 
        });
      }
    },
  });
}

/**
 * Update an existing review
 */
export function useUpdateReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateReviewInput) => updateReview(data),
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate all review queries to refresh data
        queryClient.invalidateQueries({ 
          queryKey: reviewKeys.all 
        });
      }
    },
  });
}

/**
 * Add provider response to a review
 */
export function useAddProviderResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProviderResponseInput) => addProviderResponse(data),
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate all review queries to show the new response
        queryClient.invalidateQueries({
          queryKey: reviewKeys.all
        });
      }
    },
  });
}

/**
 * Toggle like on a review
 */
export function useToggleReviewLike(providerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ToggleReviewLikeInput) => toggleReviewLike(data),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: reviewKeys.provider(providerId) });

      // Snapshot the previous value
      const previousData = queryClient.getQueriesData({ queryKey: reviewKeys.provider(providerId) });

      // Optimistically update the cache
      queryClient.setQueriesData(
        { queryKey: reviewKeys.provider(providerId) },
        (old: ReviewCacheData | undefined) => {
          if (!old?.reviews) return old;
          return {
            ...old,
            reviews: old.reviews.map((review: ReviewCacheItem) => {
              if (review.id === variables.reviewId) {
                const newHasLiked = !review.hasLiked;
                return {
                  ...review,
                  hasLiked: newHasLiked,
                  likeCount: newHasLiked ? review.likeCount + 1 : review.likeCount - 1,
                };
              }
              return review;
            }),
          };
        }
      );

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      // If the mutation fails, restore the previous data
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data is correct
      queryClient.invalidateQueries({ queryKey: reviewKeys.provider(providerId) });
    },
  });
}

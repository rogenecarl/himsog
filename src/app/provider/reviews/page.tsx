"use client";

import { useState } from "react";
import { useProviderProfile } from "@/hooks/use-provider-profile";
import { useProviderReviews, useProviderStats } from "@/hooks/use-review-hook";
import { Loader2, AlertCircle, Star } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProviderReviewStats } from "@/components/provider-components/reviews-component/provider-review-stats";
import { ProviderReviewList } from "@/components/provider-components/reviews-component/provider-review-list";

export default function ProviderReviewsPage() {
  const { data: provider, isLoading: profileLoading } = useProviderProfile();
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch reviews with TanStack Query
  const { data: reviewsData, isLoading: isLoadingReviews } = useProviderReviews({
    providerId: provider?.id || "",
    page: currentPage,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Fetch stats with TanStack Query
  const { data: stats } = useProviderStats(provider?.id || "");

  // Extract data from query results
  const reviews = reviewsData?.reviews || [];
  const totalReviews = reviewsData?.pagination.totalCount || 0;
  const hasMore = reviewsData 
    ? reviewsData.pagination.page < reviewsData.pagination.totalPages 
    : false;

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handleResponseAdded = () => {
    // TanStack Query will automatically refetch due to cache invalidation
    setCurrentPage(1);
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center space-y-3">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Provider Profile Not Found</AlertTitle>
          <AlertDescription>
            Please complete your provider profile to view reviews.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-1">
            Reviews & Ratings
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Manage and respond to patient reviews
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats ? (
        <ProviderReviewStats stats={stats} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Rating Distribution */}
      {stats && stats.totalReviews > 0 && (
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
              <Star className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
              Rating Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {rating}
                      </span>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    </div>

                    {/* Progress Bar */}
                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 dark:bg-yellow-500 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <span className="text-sm text-slate-600 dark:text-slate-400 w-16 text-right">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {isLoadingReviews && currentPage === 1 ? (
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10">
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400 dark:text-slate-500" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <ProviderReviewList
          reviews={reviews}
          totalReviews={totalReviews}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          isLoading={isLoadingReviews}
          onResponseAdded={handleResponseAdded}
        />
      )}
    </div>
  );
}

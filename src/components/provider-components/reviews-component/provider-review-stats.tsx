"use client";

import { Star, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProviderReviewStatsProps {
  stats: {
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
}

export function ProviderReviewStats({ stats }: ProviderReviewStatsProps) {
  const { averageRating, totalReviews, ratingDistribution } = stats;

  // Calculate percentage for each rating
  const getPercentage = (count: number) => {
    if (totalReviews === 0) return 0;
    return (count / totalReviews) * 100;
  };

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      {/* Average Rating */}
      <Card className="border-l-4 border-l-yellow-500 dark:border-l-yellow-400 bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Average Rating
          </CardTitle>
          <Star className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex items-center gap-1 mt-1">
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                className={cn(
                  "h-4 w-4",
                  index < Math.floor(averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-slate-300 dark:fill-slate-600 text-slate-300 dark:text-slate-600"
                )}
              />
            ))}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Out of 5 stars
          </p>
        </CardContent>
      </Card>

      {/* Total Reviews */}
      <Card className="border-l-4 border-l-blue-500 dark:border-l-blue-400 bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Total Reviews
          </CardTitle>
          <Users className="h-4 w-4 text-blue-500 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {totalReviews}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {totalReviews === 1 ? "Review received" : "Reviews received"}
          </p>
        </CardContent>
      </Card>

      {/* 5-Star Reviews */}
      <Card className="border-l-4 border-l-purple-500 dark:border-l-purple-400 bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
            5-Star Reviews
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-500 dark:text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {ratingDistribution[5]}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {totalReviews > 0 ? `${getPercentage(ratingDistribution[5]).toFixed(0)}% of total` : "No reviews yet"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { ReviewCard } from "./review-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  isAnonymous: boolean;
  createdAt: Date;
  isEdited: boolean;
  providerResponse: string | null;
  respondedAt: Date | null;
  user: {
    name: string | null;
    image: string | null;
  };
}

interface ReviewListProps {
  reviews: Review[];
  totalReviews: number;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading?: boolean;
}

export function ReviewList({
  reviews,
  totalReviews,
  onLoadMore,
  hasMore,
  isLoading = false,
}: ReviewListProps) {
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "lowest">(
    "newest"
  );

  // Sort reviews based on selected option
  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "highest":
        return b.rating - a.rating;
      case "lowest":
        return a.rating - b.rating;
      default:
        return 0;
    }
  });

  if (reviews.length === 0) {
    return (
      <Card className="bg-white dark:bg-[#1E293B] border-gray-200 dark:border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <MessageSquare className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            All Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center text-center">
            <p className="text-gray-500 dark:text-slate-400">
              No reviews yet. Be the first to leave a review!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-[#1E293B] border-gray-200 dark:border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <MessageSquare className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            All Reviews ({totalReviews})
          </CardTitle>

          <Select
            value={sortBy}
            onValueChange={(value) =>
              setSortBy(value as "newest" | "highest" | "lowest")
            }
          >
            <SelectTrigger className="w-[180px] bg-white dark:bg-slate-800 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-white/10">
              <SelectItem value="newest" className="text-gray-900 dark:text-white">Newest First</SelectItem>
              <SelectItem value="highest" className="text-gray-900 dark:text-white">Highest Rated</SelectItem>
              <SelectItem value="lowest" className="text-gray-900 dark:text-white">Lowest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Reviews List */}
        {sortedReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center pt-4">
            <Button
              onClick={onLoadMore}
              disabled={isLoading}
              variant="outline"
              className="px-8 bg-white dark:bg-slate-800 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              {isLoading ? "Loading..." : "Load More Reviews"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

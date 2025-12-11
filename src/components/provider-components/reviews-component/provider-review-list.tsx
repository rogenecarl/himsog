"use client";

import { useState } from "react";
import { Star, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { useAddProviderResponse } from "@/hooks/use-review-hook";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  isEdited: boolean;
  providerResponse: string | null;
  respondedAt: Date | null;
  user: {
    name: string | null;
    image: string | null;
  };
}

interface ProviderReviewListProps {
  reviews: Review[];
  totalReviews: number;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading?: boolean;
  onResponseAdded?: () => void;
}

export function ProviderReviewList({
  reviews,
  totalReviews,
  onLoadMore,
  hasMore,
  isLoading = false,
  onResponseAdded,
}: ProviderReviewListProps) {
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "lowest">("newest");
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [response, setResponse] = useState("");

  const addResponseMutation = useAddProviderResponse();

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

  const handleRespondClick = (reviewId: string) => {
    setRespondingTo(reviewId);
    setResponse("");
  };

  const handleCancelResponse = () => {
    setRespondingTo(null);
    setResponse("");
  };

  const handleSubmitResponse = (reviewId: string) => {
    if (!response.trim() || response.length < 10) {
      toast.error("Response must be at least 10 characters");
      return;
    }

    addResponseMutation.mutate(
      {
        reviewId,
        response: response.trim(),
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            toast.success("Response added successfully!");
            setRespondingTo(null);
            setResponse("");
            onResponseAdded?.();
          } else {
            toast.error(result.error || "Failed to add response");
          }
        },
        onError: (error) => {
          toast.error("An error occurred while adding your response");
          console.error(error);
        },
      }
    );
  };

  if (reviews.length === 0) {
    return (
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">No Reviews Yet</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              You haven&apos;t received any reviews yet. Keep providing excellent service!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Sort */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          All Reviews ({totalReviews})
        </h3>

        <Select
          value={sortBy}
          onValueChange={(value) =>
            setSortBy(value as "newest" | "highest" | "lowest")
          }
        >
          <SelectTrigger className="w-[180px] bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10">
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="highest">Highest Rated</SelectItem>
            <SelectItem value="lowest">Lowest Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {sortedReviews.map((review) => (
          <Card key={review.id} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10">
            <CardContent className="pt-6">
              {/* User Info & Rating */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      {review.user.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {review.user.name || "Anonymous User"}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {formatDistanceToNow(new Date(review.createdAt), {
                        addSuffix: true,
                      })}
                      {review.isEdited && " (edited)"}
                    </p>
                  </div>
                </div>

                {/* Star Rating */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      className={cn(
                        "h-4 w-4",
                        index < review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-300 text-gray-300"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Review Comment */}
              {review.comment && (
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                  {review.comment}
                </p>
              )}

              {/* Provider Response */}
              {review.providerResponse ? (
                <div className="mt-4 pl-4 border-l-2 border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-r-lg">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                    Your Response
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">{review.providerResponse}</p>
                  {review.respondedAt && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {formatDistanceToNow(new Date(review.respondedAt), {
                        addSuffix: true,
                      })}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  {respondingTo === review.id ? (
                    <div className="mt-4 space-y-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                      <Textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="Write your response to this review..."
                        className="min-h-[100px] resize-none bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                        maxLength={500}
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {response.length}/500 characters
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelResponse}
                            disabled={addResponseMutation.isPending}
                            className="border-slate-300 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSubmitResponse(review.id)}
                            disabled={addResponseMutation.isPending || response.length < 10}
                            className="bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-700"
                          >
                            {addResponseMutation.isPending ? "Submitting..." : "Submit Response"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRespondClick(review.id)}
                        className="text-blue-600 dark:text-cyan-400 hover:text-blue-700 dark:hover:text-cyan-300 border-slate-300 dark:border-white/10"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Respond to Review
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={onLoadMore}
            disabled={isLoading}
            variant="outline"
            className="px-8 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5"
          >
            {isLoading ? "Loading..." : "Load More Reviews"}
          </Button>
        </div>
      )}
    </div>
  );
}

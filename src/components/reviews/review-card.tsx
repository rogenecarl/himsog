import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
    isEdited: boolean;
    isAnonymous?: boolean;
    providerResponse: string | null;
    respondedAt: Date | null;
    user: {
      name: string | null;
      image: string | null;
    };
  };
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card className="bg-white dark:bg-[#1E293B] border-gray-200 dark:border-white/10">
      <CardContent className="pt-6">
        {/* User Info & Rating */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                {review.isAnonymous 
                  ? "?" 
                  : (review.user.name?.charAt(0).toUpperCase() || "U")}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {review.isAnonymous ? "Anonymous User" : (review.user.name || "Anonymous User")}
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-400">
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
                    : "fill-gray-300 dark:fill-slate-600 text-gray-300 dark:text-slate-600"
                )}
              />
            ))}
          </div>
        </div>

        {/* Review Comment */}
        {review.comment && (
          <p className="text-gray-700 dark:text-slate-300 leading-relaxed mb-3">{review.comment}</p>
        )}

        {/* Provider Response */}
        {review.providerResponse && (
          <div className="mt-4 pl-4 border-l-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-r-lg">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-400 mb-1">
              Provider Response
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-300">{review.providerResponse}</p>
            {review.respondedAt && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {formatDistanceToNow(new Date(review.respondedAt), {
                  addSuffix: true,
                })}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

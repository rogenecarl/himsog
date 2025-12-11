import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReviewStatsProps {
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

export function ReviewStats({ stats }: ReviewStatsProps) {
  const { averageRating, totalReviews, ratingDistribution } = stats;

  // Calculate percentage for each rating
  const getPercentage = (count: number) => {
    if (totalReviews === 0) return 0;
    return (count / totalReviews) * 100;
  };

  return (
    <Card className="bg-white dark:bg-[#1E293B] border-gray-200 dark:border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Star className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
          Patient Reviews
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Overall Rating */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-white/10">
          <div className="text-center w-full">
            <div className="text-4xl font-bold text-gray-900 dark:text-white">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center gap-1 mt-2">
              {Array.from({ length: 5 }, (_, index) => (
                <Star
                  key={index}
                  className={cn(
                    "h-5 w-5",
                    index < Math.floor(averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-300 dark:fill-gray-600 text-gray-300 dark:text-gray-600"
                  )}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
              {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingDistribution[rating as keyof typeof ratingDistribution];
            const percentage = getPercentage(count);

            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                    {rating}
                  </span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                </div>

                {/* Progress Bar */}
                <div className="flex-1 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 dark:bg-yellow-500 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <span className="text-sm text-gray-600 dark:text-slate-400 w-8 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

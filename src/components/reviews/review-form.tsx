"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRating } from "./star-rating";
import { useCreateReview } from "@/hooks/use-review-hook";
import { toast } from "sonner";

interface ReviewFormProps {
  appointmentId: string;
  providerId: string;
  providerName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({
  appointmentId,
  providerId,
  providerName,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  const createReviewMutation = useCreateReview();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      appointmentId,
      rating: 0,
      comment: "",
      isAnonymous: false,
    },
  });

  const onSubmit = async (data: { comment?: string }) => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    // Clean up comment - if it's empty or just whitespace, set to null
    const cleanComment = data.comment?.trim();
    const finalComment = cleanComment && cleanComment.length > 0 ? cleanComment : null;
    
    const reviewData = {
      appointmentId,
      providerId,
      rating,
      comment: finalComment,
      isAnonymous,
    };

    createReviewMutation.mutate(reviewData, {
      onSuccess: (result) => {
        if (result.success) {
          toast.success("Review submitted successfully!");
          onSuccess?.();
        } else {
          toast.error(result.error || "Failed to submit review");
        }
      },
      onError: (error) => {
        toast.error("An error occurred while submitting your review");
        console.error(error);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Provider Name */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Review {providerName}
        </h3>
        <p className="text-sm text-gray-600">
          Share your experience to help others make informed decisions
        </p>
      </div>

      {/* Star Rating */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-900">
          Overall Rating <span className="text-red-500">*</span>
        </Label>
        <div className="flex items-center gap-3">
          <StarRating
            value={rating}
            onChange={(value) => {
              setRating(value);
              setValue("rating", value);
            }}
            size="lg"
          />
          {rating > 0 && (
            <span className="text-sm font-medium text-gray-700">
              {rating} {rating === 1 ? "star" : "stars"}
            </span>
          )}
        </div>
        {errors.rating && (
          <p className="text-sm text-red-600">{errors.rating.message}</p>
        )}
      </div>

      {/* Written Review */}
      <div className="space-y-2">
        <Label htmlFor="comment" className="text-sm font-medium text-gray-900">
          Your Review (Optional)
        </Label>
        <Textarea
          id="comment"
          {...register("comment")}
          placeholder="Tell us about your experience..."
          className="min-h-[120px] resize-none"
          maxLength={500}
        />
        <p className="text-xs text-gray-500">
          Share details about your visit, the service quality, and overall experience
        </p>
        {errors.comment && (
          <p className="text-sm text-red-600">{errors.comment.message}</p>
        )}
      </div>

      {/* Anonymous Option */}
      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
        <input
          type="checkbox"
          id="isAnonymous"
          checked={isAnonymous}
          onChange={(e) => {
            setIsAnonymous(e.target.checked);
            setValue("isAnonymous", e.target.checked);
          }}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <Label htmlFor="isAnonymous" className="text-sm text-gray-700 cursor-pointer">
          Post this review anonymously (your name will be hidden)
        </Label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={createReviewMutation.isPending}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={createReviewMutation.isPending || rating === 0}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
        </Button>
      </div>
    </form>
  );
}

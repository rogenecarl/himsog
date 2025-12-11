"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  MessageSquareHeart,
  Lightbulb,
  Bug,
  Sparkles,
  Users,
  HelpCircle,
  Star,
  Send,
  ArrowLeft,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { submitFeedback } from "@/actions/feedback/feedback-actions";
import { authClient } from "@/lib/auth-client";

const feedbackSchema = z.object({
  category: z.enum(["FEATURE_REQUEST", "BUG_REPORT", "IMPROVEMENT", "USER_EXPERIENCE", "OTHER"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title too long"),
  message: z.string().min(20, "Please provide more details (at least 20 characters)").max(2000, "Message too long"),
  satisfactionRating: z.number().min(1).max(5).optional(),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

const categories = [
  {
    value: "FEATURE_REQUEST",
    label: "Feature Request",
    description: "Suggest a new feature",
    icon: Lightbulb,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    borderColor: "border-yellow-200 dark:border-yellow-800",
  },
  {
    value: "BUG_REPORT",
    label: "Bug Report",
    description: "Report something broken",
    icon: Bug,
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-800",
  },
  {
    value: "IMPROVEMENT",
    label: "Improvement",
    description: "Suggest an enhancement",
    icon: Sparkles,
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    borderColor: "border-purple-200 dark:border-purple-800",
  },
  {
    value: "USER_EXPERIENCE",
    label: "User Experience",
    description: "Share UX feedback",
    icon: Users,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  {
    value: "OTHER",
    label: "Other",
    description: "General feedback",
    icon: HelpCircle,
    color: "text-slate-500",
    bgColor: "bg-slate-50 dark:bg-slate-800",
    borderColor: "border-slate-200 dark:border-slate-700",
  },
];

export default function FeedbackPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        if (!session?.data?.user) {
          router.push("/auth/sign-in?redirect=/feedback");
          return;
        }
      } catch {
        router.push("/auth/sign-in?redirect=/feedback");
        return;
      }
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, [router]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      priority: "MEDIUM",
    },
  });

  const selectedCategory = watch("category");
  const satisfactionRating = watch("satisfactionRating");

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    try {
      const result = await submitFeedback(data);

      if (result.success) {
        setIsSubmitted(true);
        toast.success(result.message);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
          <CardContent className="pt-10 pb-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Thank You!
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Your feedback has been submitted successfully. We really appreciate you taking the time to help us improve Himsog.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => setIsSubmitted(false)}
                className="border-slate-200 dark:border-white/10"
              >
                Submit Another
              </Button>
              <Button
                onClick={() => router.push("/browse-services")}
                className="bg-gradient-to-r from-cyan-500 to-blue-600"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19]">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#1E293B]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <Link
            href="/browse-services"
            className="inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
              <MessageSquareHeart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Help Us Improve
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Share your thoughts and help shape the future of Himsog
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Category Selection */}
          <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900 dark:text-white">
                What type of feedback do you have?
              </CardTitle>
              <CardDescription>
                Select the category that best describes your feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isSelected = selectedCategory === category.value;
                  return (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => setValue("category", category.value as FeedbackFormData["category"])}
                      className={cn(
                        "p-4 rounded-lg border-2 text-left transition-all",
                        isSelected
                          ? `${category.bgColor} ${category.borderColor}`
                          : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                      )}
                    >
                      <Icon className={cn("h-5 w-5 mb-2", category.color)} />
                      <p className="font-medium text-slate-900 dark:text-white text-sm">
                        {category.label}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {category.description}
                      </p>
                    </button>
                  );
                })}
              </div>
              {errors.category && (
                <p className="text-sm text-red-500 mt-2">{errors.category.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Satisfaction Rating */}
          <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900 dark:text-white">
                How satisfied are you with Himsog?
              </CardTitle>
              <CardDescription>
                Rate your overall experience (optional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setValue("satisfactionRating", rating)}
                    onMouseEnter={() => setHoveredRating(rating)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-2 transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "h-8 w-8 transition-colors",
                        (hoveredRating || satisfactionRating || 0) >= rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-slate-300 dark:text-slate-600"
                      )}
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2">
                {satisfactionRating === 1 && "Very Dissatisfied"}
                {satisfactionRating === 2 && "Dissatisfied"}
                {satisfactionRating === 3 && "Neutral"}
                {satisfactionRating === 4 && "Satisfied"}
                {satisfactionRating === 5 && "Very Satisfied"}
              </p>
            </CardContent>
          </Card>

          {/* Details */}
          <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900 dark:text-white">
                Tell us more
              </CardTitle>
              <CardDescription>
                Provide details about your feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Brief summary of your feedback"
                  {...register("title")}
                  className="bg-white dark:bg-slate-900"
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Details</Label>
                <Textarea
                  id="message"
                  placeholder="Please describe your feedback in detail. What would you like to see improved or added?"
                  rows={6}
                  {...register("message")}
                  className="bg-white dark:bg-slate-900 resize-none"
                />
                {errors.message && (
                  <p className="text-sm text-red-500">{errors.message.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Priority (optional)</Label>
                <RadioGroup
                  defaultValue="MEDIUM"
                  onValueChange={(value) => setValue("priority", value as FeedbackFormData["priority"])}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="LOW" id="low" />
                    <Label htmlFor="low" className="text-sm font-normal cursor-pointer">
                      Low
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="MEDIUM" id="medium" />
                    <Label htmlFor="medium" className="text-sm font-normal cursor-pointer">
                      Medium
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="HIGH" id="high" />
                    <Label htmlFor="high" className="text-sm font-normal cursor-pointer">
                      High
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="border-slate-200 dark:border-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </span>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

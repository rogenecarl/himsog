"use client";

import { z } from "zod";
import { CreateProviderSchema } from "@/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, ChevronRight, Loader2, Mail, Phone, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useOnboardingCreateProviderProfileStore } from "@/store/create-provider-profile-store";
import { useEffect, useState } from "react";
import { useCategories } from "@/hooks/use-category";
import { OnboardingStepper } from "./onboarding-stepper";
import { cn } from "@/lib/utils";

const onboardingInfoFormSchema = CreateProviderSchema.pick(
  {
    healthcareName: true,
    categoryId: true,
    description: true,
    email: true,
    phoneNumber: true,
  }
);
type OnboardingInfoFormType = z.infer<typeof onboardingInfoFormSchema>;
export default function OnboardingStep1InfoForm() {
  const { data: categories = [] } = useCategories();
  const [isNavigating, setIsNavigating] = useState(false);

  const router = useRouter();
  const { setData, ...storedData } = useOnboardingCreateProviderProfileStore(
    (state) => state
  );

  const form = useForm<OnboardingInfoFormType>({
    resolver: zodResolver(onboardingInfoFormSchema),
    defaultValues: {
      healthcareName: "",
      categoryId: "",
      description: "",
      email: "",
      phoneNumber: "",
    },
  });
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = form;

  // Watch the categoryId for reactive updates
  const watchedCategoryId = watch("categoryId");

  // Load data from store when component mounts and categories are loaded
  useEffect(() => {
    if (categories.length > 0) {
      reset({
        healthcareName: storedData.healthcareName || "",
        categoryId: storedData.categoryId || "",
        description: storedData.description || "",
        email: storedData.email || "",
        phoneNumber: storedData.phoneNumber || "",
      });
    }
  }, [
    storedData.healthcareName,
    storedData.categoryId,
    storedData.description,
    storedData.email,
    storedData.phoneNumber,
    categories.length,
    reset,
  ]);

  // Get the selected category ID reactively
  const selectedCategoryId = watchedCategoryId || "";

  // Find the selected category for display
  const selectedCategory = categories.find(
    (cat) => cat.id.toString() === selectedCategoryId
  );
  const onSubmit = (data: OnboardingInfoFormType) => {
    setIsNavigating(true);
    setData(data);
    console.log("Form Data:", data);
    router.push("/provider/onboarding/step-2");
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
      {/* Progress Stepper */}
      <OnboardingStepper currentStep={1} />

      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25">
          <Building2 className="h-7 w-7 text-white" />
        </div>
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl text-slate-900 dark:text-white">
          Business Information
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto text-sm sm:text-base">
          Let&apos;s start with the basics about your healthcare practice
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Provider Details Card */}
          <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/50 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Provider Details</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Basic information about your practice</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Provider Name */}
                <div className="space-y-2">
                  <Label htmlFor="healthcareName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Provider Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="healthcareName"
                    {...register("healthcareName")}
                    placeholder="e.g., City Medical Center"
                    className={cn(
                      "h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white transition-colors",
                      errors.healthcareName && "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                  {errors.healthcareName && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                      {errors.healthcareName.message}
                    </p>
                  )}
                </div>

                {/* Category Type */}
                <div className="space-y-2">
                  <Label htmlFor="categoryId" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Healthcare Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedCategoryId}
                    onValueChange={(value) => setValue("categoryId", value, { shouldValidate: true })}
                  >
                    <SelectTrigger
                      className={cn(
                        "h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white",
                        errors.categoryId && "border-red-500 focus:ring-red-500"
                      )}
                      aria-label="Select healthcare category"
                    >
                      {selectedCategory ? (
                        <div className="flex items-center gap-2">
                          {selectedCategory.icon && (
                            <span
                              className="flex h-5 w-5 items-center justify-center rounded-md text-sm"
                              style={{ backgroundColor: `${selectedCategory.color}20`, color: selectedCategory.color }}
                            >
                              {selectedCategory.icon}
                            </span>
                          )}
                          <span className="font-medium">{selectedCategory.name}</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="Select your practice type" />
                      )}
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10">
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                            className="cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              {category.icon && (
                                <span
                                  className="flex h-5 w-5 items-center justify-center rounded-md text-sm"
                                  style={{ backgroundColor: `${category.color}20`, color: category.color }}
                                >
                                  {category.icon}
                                </span>
                              )}
                              <span>{category.name}</span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <div className="space-y-2 p-3">
                          <Skeleton className="h-8 w-full rounded-md" />
                          <Skeleton className="h-8 w-full rounded-md" />
                          <Skeleton className="h-8 w-full rounded-md" />
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                      {errors.categoryId.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    className={cn(
                      "min-h-[100px] bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white resize-none",
                      errors.description && "border-red-500 focus-visible:ring-red-500"
                    )}
                    placeholder="Tell patients about your practice, specialties, and what makes you unique..."
                  />
                  {errors.description && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information Card */}
          <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/50 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                  <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Contact Information</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">How patients can reach you</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute left-0 top-0 h-11 w-11 flex items-center justify-center rounded-l-md border border-r-0 border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800">
                      <Mail className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="contact@yourpractice.com"
                      className={cn(
                        "h-11 pl-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white",
                        errors.email && "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute left-0 top-0 h-11 w-11 flex items-center justify-center rounded-l-md border border-r-0 border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800">
                      <Phone className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    </div>
                    <Input
                      id="phoneNumber"
                      {...register("phoneNumber")}
                      placeholder="+63 912 345 6789"
                      className={cn(
                        "h-11 pl-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white",
                        errors.phoneNumber && "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>

                {/* Info box */}
                <div className="mt-6 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 border border-blue-100 dark:border-blue-800/30">
                  <div className="flex gap-3">
                    <Sparkles className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Pro Tip</p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Use a professional email and ensure your phone number is active for appointment confirmations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200"
            disabled={isNavigating}
          >
            {isNavigating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Continue to Services
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

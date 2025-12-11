"use client";

import { z } from "zod";
import { CreateProviderSchema } from "@/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, ChevronRight, Loader2, Mail, MapPin, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useOnboardingCreateProviderProfileStore } from "@/store/create-provider-profile-store";
import { useEffect, useState } from "react";
import { useCategories } from "@/hooks/use-category";

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
    formState: { errors },
  } = form;

  // Load data from store when component mounts and categories are loaded
  useEffect(() => {
    if (storedData.categoryId && categories.length > 0) {
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
    categories,
    reset,
  ]);

  const categoryIdValue = form.getValues("categoryId");
  const selectedCategoryId = categoryIdValue?.toString() || "0";
  const onSubmit = (data: OnboardingInfoFormType) => {
    setIsNavigating(true);
    setData(data);
    console.log("Form Data:", data);
    router.push("/provider/onboarding/step-2");
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 mx-auto">
          <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl text-slate-900 dark:text-white">
          Business Information
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          Provide details about your healthcare business for registration
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {/* Provider Details Card */}
          <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Provider Details</h2>
              </div>
              <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
                Provide information about your healthcare provider for your
                profile
              </p>
              <div className="space-y-4">
                {/* Provider Name */}
                <div className="space-y-2">
                  <Label htmlFor="healthcareName" className="text-slate-700 dark:text-slate-300">
                    Provider Name <span className="text-red-500 dark:text-red-400">*</span>
                  </Label>
                  <Input
                    id="healthcareName"
                    {...register("healthcareName")}
                    placeholder="Enter your provider name"
                    className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                  />
                  {errors.healthcareName && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                      {errors.healthcareName.message}
                    </p>
                  )}
                </div>
                {/* Category Type */}
                <div className="space-y-2">
                  <Label htmlFor="categoryId" className="text-slate-700 dark:text-slate-300">
                    Category Type <span className="text-red-500 dark:text-red-400">*</span>
                  </Label>
                  <Select
                    value={selectedCategoryId}
                    onValueChange={(value) => setValue("categoryId", value)}
                  >
                    <SelectTrigger
                      className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                      aria-label="Select provider type"
                    >
                      <SelectValue placeholder="Select provider type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10">
                      <SelectItem value="0" disabled>
                        Select provider type
                      </SelectItem>
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            <div className="flex items-center gap-2">
                              {category.icon && (
                                <span
                                  className="flex h-4 w-4 items-center justify-center"
                                  style={{ color: category.color }}
                                >
                                  {category.icon}
                                </span>
                              )}
                              {category.name}
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <div className="space-y-2 p-2">
                          <Skeleton className="h-5 w-full rounded-sm bg-slate-200 dark:bg-white/10" />
                          <Skeleton className="h-5 w-full rounded-sm bg-slate-200 dark:bg-white/10" />
                          <Skeleton className="h-5 w-full rounded-sm bg-slate-200 dark:bg-white/10" />
                          <Skeleton className="h-5 w-full rounded-sm bg-slate-200 dark:bg-white/10" />
                          <Skeleton className="h-5 w-full rounded-sm bg-slate-200 dark:bg-white/10" />
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                      {errors.categoryId.message}
                    </p>
                  )}
                </div>
                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-700 dark:text-slate-300">Description</Label>
                  <textarea
                    id="description"
                    {...register("description")}
                    className="flex h-24 w-full rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                    placeholder="Describe your healthcare practice (services offered, specialties, etc.)"
                  />
                  {errors.description && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Location Information Card */}
          <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Location Information</h2>
              </div>
              <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
                Your business location will be displayed to patients searching
                for healthcare services
              </p>
              <div className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                    Email <span className="text-red-500 dark:text-red-400">*</span>
                  </Label>
                  <div className="flex w-full">
                    <div className="flex items-center rounded-l-md border border-r-0 border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-slate-900 px-3">
                      <Mail className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="provider@example.com"
                      className="rounded-l-none w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-slate-700 dark:text-slate-300">
                    Phone <span className="text-red-500 dark:text-red-400">*</span>
                  </Label>
                  <div className="flex w-full">
                    <div className="flex items-center rounded-l-md border border-r-0 border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-slate-900 px-3">
                      <Phone className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    </div>
                    <Input
                      id="phoneNumber"
                      {...register("phoneNumber")}
                      placeholder="+63 912 345 6789"
                      className="rounded-l-none w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="mt-8 flex justify-end">
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-700 flex items-center"
            disabled={isNavigating}
          >
            {isNavigating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

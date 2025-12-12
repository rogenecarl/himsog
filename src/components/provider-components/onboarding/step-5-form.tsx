"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOnboardingCreateProviderProfileStore } from "@/store/create-provider-profile-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertCircle,
  ChevronLeft,
  Image as ImageIcon,
  Loader2,
  Upload,
  X,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useState, useCallback } from "react";
import { useCreateProviderProfile } from "@/hooks/use-create-provider-profile";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { OnboardingStepper } from "./onboarding-stepper";
import { cn } from "@/lib/utils";

const onboardingInfoFormSchema = z.object({
  coverPhoto: z.any().nullable().optional(),
});

type OnboardingInfoFormType = z.infer<typeof onboardingInfoFormSchema>;

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " bytes";
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  else return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

export default function OnboardingSummaryForm() {

  const allStoredData = useOnboardingCreateProviderProfileStore(
    (state) => state
  );
  // const { setData, ...providerData } = allStoredData;
  const { ...providerData } = allStoredData;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const createProviderMutation = useCreateProviderProfile();

  const form = useForm<OnboardingInfoFormType>({
    resolver: zodResolver(onboardingInfoFormSchema),
    defaultValues: {
      coverPhoto: null,
    },
  });
  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verify that the file is an image
    if (!file.type.startsWith("image/")) {
      form.setError("coverPhoto", {
        type: "manual",
        message:
          "Only image files are accepted. Please select a valid image file.",
      });
      return;
    }

    setSelectedFile(file);
    setValue("coverPhoto", file);
    form.clearErrors("coverPhoto");

    // Create preview for images
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearSelectedFile = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl("");
    setValue("coverPhoto", null);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  }, [setValue]);

  const onSubmit = useCallback(async (data: OnboardingInfoFormType) => {
    try {
      console.log("Starting form submission...");
      console.log("Provider Data:", providerData);
      
      const formData = new FormData();

      // Append the simple key-value pairs from your store using camelCase
      formData.append("healthcareName", providerData.healthcareName || "");
      formData.append("categoryId", providerData.categoryId?.toString() || "");
      formData.append("description", providerData.description || "");
      formData.append("email", providerData.email || "");
      formData.append("phoneNumber", providerData.phoneNumber || "");
      formData.append("longitude", providerData.longitude?.toString() || "0");
      formData.append("latitude", providerData.latitude?.toString() || "0");
      formData.append("address", providerData.address || "");
      formData.append("city", providerData.city || "");
      formData.append("province", providerData.province || "");
      formData.append("slotDuration", providerData.slotDuration?.toString() || "30");

      console.log("Basic fields appended");

      // For arrays of objects, stringify them. The backend will need to parse them.
      formData.append("services", JSON.stringify(providerData.services || []));
      formData.append(
        "operatingHours",
        JSON.stringify(providerData.operatingHours || [])
      );

      console.log("Services:", providerData.services);
      console.log("Operating Hours:", providerData.operatingHours);

      // Handle documents - we need to append each document file separately
      if (providerData.documents && providerData.documents.length > 0) {
        console.log("Processing documents:", providerData.documents.length);
        
        // Add document metadata as JSON
        const documentsMetadata = providerData.documents.map((doc, index) => ({
          document_type: doc.documentType,
          index: index, // To match files with metadata
        }));
        formData.append("documents_metadata", JSON.stringify(documentsMetadata));

        // Add each document file with indexed name
        providerData.documents.forEach((doc, index) => {
          if (doc.filePath instanceof File) {
            console.log(`Appending document ${index}:`, doc.filePath.name);
            formData.append(`documents[${index}][filePath]`, doc.filePath);
            formData.append(
              `documents[${index}][documentType]`,
              doc.documentType
            );
          }
        });
      } else {
        console.log("No documents to process");
        formData.append("documents_metadata", JSON.stringify([]));
      }

      // Append the actual cover photo file
      if (data.coverPhoto) {
        console.log("Appending cover photo:", data.coverPhoto.name);
        formData.append("coverPhoto", data.coverPhoto);
      } else {
        console.log("No cover photo selected");
      }

      console.log("Submitting form data to mutation...");

      // Send data to the backend using the TanStack mutation
      createProviderMutation.mutate(formData, {
        onSuccess: () => {
          console.log("Profile created successfully!");
          // Clear the form and stored data on success
          form.reset();
          clearSelectedFile();
          useOnboardingCreateProviderProfileStore.getState().clearData();
          // The hook will handle navigation to dashboard
        },
        onError: (error: Error) => {
          console.error("Failed to create provider profile:", error);
          // Error toast is handled by the hook
        },
      });
    } catch (error) {
      console.error("Error preparing form data:", error);
      toast.error("Failed to prepare form data. Please try again.");
    }
  }, [providerData, createProviderMutation, form, clearSelectedFile]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
      {/* Progress Stepper */}
      <OnboardingStepper currentStep={5} />

      {/* Header Section */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/25">
          <CheckCircle2 className="h-7 w-7 text-white" />
        </div>
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl text-slate-900 dark:text-white">
          Almost Done!
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto text-sm sm:text-base">
          Add a cover photo to complete your profile and attract more patients
        </p>
      </div>

      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(onSubmit)(e);
      }} className="space-y-6">
        <Card className="overflow-hidden border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/50 shadow-sm">
          <CardContent className="p-6">
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                <ImageIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Cover Photo</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Make your profile stand out</p>
              </div>
            </div>

            {/* Cover Photo Upload Section */}
            <div
              className={cn(
                "relative rounded-xl border-2 border-dashed p-8 transition-all cursor-pointer",
                selectedFile
                  ? "border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20"
                  : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10"
              )}
              onClick={() => {
                if (!selectedFile) {
                  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                  fileInput?.click();
                }
              }}
            >
              {selectedFile ? (
                <div className="space-y-4">
                  {previewUrl ? (
                    <div className="relative max-w-md mx-auto">
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-white shadow-lg">
                        <Image
                          src={previewUrl}
                          alt="Cover photo preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-8 w-8 rounded-full shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearSelectedFile();
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="h-16 w-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mx-auto mb-3">
                        <ImageIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {formatFileSize(selectedFile.size)}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearSelectedFile();
                        }}
                      >
                        <X className="mr-1 h-3 w-3" />
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Click to upload your cover photo
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    JPG, PNG, WEBP up to 2MB
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                    Recommended: 1200 x 630 pixels
                  </p>
                </div>
              )}

              <input
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png,.gif,.svg,.webp"
                onChange={handleFileSelect}
              />
            </div>

            {/* Validation Errors */}
            {errors.coverPhoto && (
              <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 p-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                <p className="text-xs text-red-700 dark:text-red-300">{errors.coverPhoto.message as string}</p>
              </div>
            )}

            {/* Pro Tip */}
            <div className="mt-6 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 border border-indigo-100 dark:border-indigo-800/30">
              <div className="flex gap-3">
                <Sparkles className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">Pro Tip</p>
                  <p className="text-xs text-indigo-700 dark:text-indigo-300">
                    Profiles with high-quality cover photos receive 3x more engagement. Use a professional image of your clinic, team, or services.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {createProviderMutation.isError && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">Submission Failed</p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                {createProviderMutation.error instanceof Error
                  ? createProviderMutation.error.message
                  : "Failed to create provider profile. Please try again."}
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4">
          <Link href="/provider/onboarding/step-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="border-slate-300 dark:border-white/10"
              disabled={createProviderMutation.isPending}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <Button
            type="submit"
            size="lg"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200"
            disabled={createProviderMutation.isPending}
          >
            {createProviderMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Profile...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Complete Profile
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOnboardingCreateProviderProfileStore } from "@/store/create-provider-profile-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { useCreateProviderProfile } from "@/hooks/use-create-provider-profile";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

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
  const router = useRouter();

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
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
          <ImageIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl text-slate-900 dark:text-white">
          Complete Your Profile
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Add a cover photo to make your profile stand out to potential clients
        </p>
      </div>

      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(onSubmit)(e);
      }} className="space-y-6">
        <Card className="overflow-hidden border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800">
          <CardContent className="p-6 sm:p-8">
            {/* Section Header */}
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
                <ImageIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Cover Photo</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Upload an image that represents your healthcare service
                </p>
              </div>
            </div>

            <div className="space-y-8">
              {/* Cover Photo Upload Section */}
              <div className="space-y-4">
                <div
                  className={`relative rounded-lg border-2 border-dashed p-6 transition-colors ${
                    selectedFile
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-300 bg-gray-50 hover:border-gray-400"
                  }`}
                >
                  {selectedFile ? (
                    <div className="space-y-4">
                      {/* File Preview */}
                      {previewUrl ? (
                        <div className="relative">
                          <Image
                            src={previewUrl}
                            alt="Cover photo preview"
                            className="mx-auto max-h-64 rounded object-contain"
                            height={50}
                            width={50}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                            onClick={clearSelectedFile}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <ImageIcon className="mx-auto h-12 w-12 text-blue-600" />
                          <p className="mt-2 font-medium text-blue-700">
                            {selectedFile.name}
                          </p>
                          <p className="text-sm text-blue-600">
                            {formatFileSize(selectedFile.size)}
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={clearSelectedFile}
                          >
                            <X className="mr-1 h-3 w-3" />
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm font-medium text-gray-700">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        JPG, JPEG, PNG, GIF, SVG, WEBP (MAX. 2MB)
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-3"
                        onClick={() => {
                          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                          fileInput?.click();
                        }}
                      >
                        Choose File
                      </Button>
                    </div>
                  )}

                  <input
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.gif,.svg,.webp"
                    onChange={handleFileSelect}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Accepted formats: JPG, JPEG, PNG, GIF, SVG, WEBP up to 2MB
                </p>
              </div>

              {/* Validation Errors */}
              {errors.coverPhoto && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    {errors.coverPhoto.message as string}
                  </AlertDescription>
                </Alert>
              )}

              {/* Information Alert */}
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Tip:</strong> A high-quality cover photo helps attract
                  more clients. Choose an image that best represents your
                  healthcare services.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {createProviderMutation.isError && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {createProviderMutation.error instanceof Error
                ? createProviderMutation.error.message
                : "Failed to create provider profile. Please try again."}
            </AlertDescription>
          </Alert>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <Link
            href="/provider/onboarding/step-4"
            className="flex items-center justify-center"
          >
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto border-slate-300 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              onClick={() => router.back()}
              disabled={createProviderMutation.isPending}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-700 sm:w-auto"
            disabled={createProviderMutation.isPending}
          >
            {createProviderMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Complete Profile
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

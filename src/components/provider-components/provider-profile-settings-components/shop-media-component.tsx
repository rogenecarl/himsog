"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Upload, Loader2, X } from "lucide-react";
import { useUpdateProviderCoverPhoto } from "@/hooks/use-update-provider-hook";
import { useState, useRef } from "react";
import Image from "next/image";

interface ProviderShopMediaProps {
  provider: {
    id: string;
    coverPhoto: string | null;
    [key: string]: unknown;
  };
}

export default function ProviderShopMedia({ provider }: ProviderShopMediaProps) {
  const updateCoverPhoto = useUpdateProviderCoverPhoto();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG, GIF, and WebP images are allowed");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    const formData = new FormData();
    formData.append("cover_photo", file);

    await updateCoverPhoto.mutateAsync(formData);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePreview = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const currentCoverPhoto = previewUrl || provider?.coverPhoto;

  return (
    <Card className="gap-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          <CardTitle className="text-slate-900 dark:text-white">Cover Photo</CardTitle>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Upload your clinics logo and cover image
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cover Image Section */}
        <div className="space-y-3">
          <div>
            <h3 className="font-medium mb-1 text-slate-900 dark:text-white">Cover Image</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Recommended size: 1200x400px. Max 5MB (JPG, PNG, WebP)
            </p>
          </div>

          {/* Cover Image Preview */}
          <div className="relative w-full h-48 border-2 border-dashed border-slate-300 dark:border-white/10 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900">
            {currentCoverPhoto ? (
              <div className="relative w-full h-full">
                <Image
                  src={currentCoverPhoto}
                  alt="Cover"
                  fill
                  className="object-cover"
                />
                {updateCoverPhoto.isPending && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
                <ImageIcon className="h-12 w-12 mb-2" />
                <p className="text-sm">No cover image</p>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleUploadClick}
              disabled={updateCoverPhoto.isPending}
              className="flex items-center gap-2 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5"
            >
              <Upload className="h-4 w-4" />
              Upload Cover
            </Button>
            {previewUrl && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleRemovePreview}
                disabled={updateCoverPhoto.isPending}
                className="hover:bg-slate-100 dark:hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

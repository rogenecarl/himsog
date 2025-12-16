"use client";

import { MapPin, Calendar, Package, Stethoscope, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, memo } from "react";
import type { Category } from "@/schemas/category.schema";
import type { ServiceType, PricingModel } from "@/lib/generated/prisma";

interface Provider {
  id: string;
  healthcareName: string;
  coverPhoto?: string | null;
  address: string;
  province: string;
  description: string | null;
  city: string;
  avgRating?: number | null;
  totalReviews?: number;
  category?: Pick<Category, 'id' | 'name' | 'slug' | 'color' | 'icon'> | null;
  services: Array<{
    id: string;
    name: string;
    description: string | null;
    type: ServiceType;
    pricingModel: PricingModel;
    fixedPrice: number;
    priceMin: number;
    priceMax: number;
    isActive: boolean;
    acceptedInsurances: Array<{
      insuranceProvider: {
        id: string;
        name: string;
      };
    }>;
    includedServices: Array<{
      childService: {
        id: string;
        name: string;
        description: string | null;
      };
    }>;
  }>;
}

interface ProviderCardProps {
  provider: Provider;
  isLoading?: boolean;
}

// Loading skeleton component
function ProviderCardSkeleton() {
  return (
    <Card className="group flex flex-col overflow-hidden border-gray-200 dark:border-white/10 bg-white dark:bg-[#1E293B] shadow-sm h-full">
      {/* Image Skeleton */}
      <div className="relative aspect-video w-full bg-gray-200 dark:bg-slate-700 animate-pulse" />

      {/* Content Skeleton */}
      <div className="flex flex-1 flex-col p-5 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-3/5 animate-pulse" />
          </div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-2/5 animate-pulse" />
        </div>

        <div className="space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-full animate-pulse" />
          <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-4/5 animate-pulse" />
        </div>

        <div className="flex gap-2 mt-auto pt-2">
          <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded flex-1 animate-pulse" />
          <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded flex-1 animate-pulse" />
        </div>
      </div>
    </Card>
  );
}

const ProviderCard = memo(function ProviderCard({
  provider,
  isLoading = false,
}: ProviderCardProps) {
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  if (isLoading) {
    return <ProviderCardSkeleton />;
  }

  // Filter out child services that are part of packages - only show top-level services
  const visibleServices = provider.services.filter((service) => {
    // Show PACKAGE services
    if (service.type === 'PACKAGE') return true;

    // Show SINGLE services that are NOT part of any package
    const isPartOfPackage = provider.services.some(
      (pkg) => pkg.type === 'PACKAGE' &&
        pkg.includedServices.some(
          (included) => included.childService.id === service.id
        )
    );

    return !isPartOfPackage;
  });

  return (
    <Link href={`/provider-details/${provider.id}`} className="block h-full">
      <Card className="group flex flex-col overflow-hidden border-gray-200 dark:border-white/10 bg-white dark:bg-[#1E293B] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md h-full rounded-xl p-0 gap-0 cursor-pointer">
        {/* 1. Header / Image Section */}
        <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">

          {/* Category Badge Overlay - UX Improvement: Shows category immediately */}
          {provider.category && (
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-flex items-center rounded-md bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-gray-700 dark:text-slate-300 shadow-sm border border-gray-100 dark:border-white/10">
                {provider.category.name}
              </span>
            </div>
          )}

          {provider.coverPhoto && !imageError ? (
            <Image
              loading="eager"
              src={provider.coverPhoto}
              alt={`${provider.healthcareName} cover`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600">
              <Calendar className="h-12 w-12" />
            </div>
          )}
        </div>

        {/* 2. Content Section */}
        <div className="flex flex-1 flex-col p-4 sm:p-5 space-y-3">

          {/* Title & Location */}
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1 group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors">
                {provider.healthcareName}
              </h3>
            </div>

            {/* Star Rating */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const rating = provider.avgRating ?? 0;
                  const isFilled = star <= Math.floor(rating);
                  const isHalf = star === Math.ceil(rating) && rating % 1 >= 0.5;
                  return (
                    <Star
                      key={star}
                      className={`h-3.5 w-3.5 ${isFilled
                          ? "fill-amber-400 text-amber-400"
                          : isHalf
                            ? "fill-amber-400/50 text-amber-400"
                            : "fill-gray-200 dark:fill-slate-700 text-gray-200 dark:text-slate-700"
                        }`}
                    />
                  );
                })}
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-slate-400">
                {provider.avgRating ? provider.avgRating.toFixed(1) : "0.0"}
              </span>
              <span className="text-xs text-gray-400 dark:text-slate-500">
                ({provider.totalReviews ?? 0} {provider.totalReviews === 1 ? "review" : "reviews"})
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-slate-500" />
              <p className="text-xs sm:text-sm font-medium line-clamp-1">
                {provider.address}, {provider.city}, {provider.province}
              </p>
            </div>
          </div>

          {/* Description - Slightly more breathing room */}
          {provider.description && (
            <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {provider.description}
            </p>
          )}

          {/* Services */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {visibleServices.slice(0, 3).map((service) => {
              const isPackage = service.type === 'PACKAGE';
              return (
                <span
                  key={service.id}
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium border ${isPackage
                      ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                      : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                    }`}
                  title={isPackage ? `Package with ${service.includedServices.length} services` : 'Single service'}
                >
                  {isPackage ? (
                    <Package className="h-3 w-3" />
                  ) : (
                    <Stethoscope className="h-3 w-3" />
                  )}
                  <span className="truncate max-w-[100px] sm:max-w-[120px]">{service.name}</span>
                </span>
              );
            })}

            {visibleServices.length > 3 && (
              <span className="inline-flex items-center rounded-md bg-slate-50 dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-white/10" title="More services available">
                +{visibleServices.length - 3}
              </span>
            )}
          </div>

          {/* Spacer to push buttons to bottom */}
          <div className="flex-1" />

          {/* 3. Actions Footer */}
          <div className="grid grid-cols-2 gap-3 pt-3 mt-2 border-t border-gray-50 dark:border-white/5">
            <Button
              variant="outline"
              className="w-full border-gray-200 dark:border-white/10 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(`/provider-details/${provider.id}`);
              }}
            >
              Details
            </Button>

            <Button
              className="w-full bg-cyan-700 hover:bg-cyan-800 text-white shadow-sm shadow-cyan-200 dark:shadow-cyan-900/20 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(`/set-appointment/${provider.id}`);
              }}
            >
              Book Now
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
});

export default ProviderCard;
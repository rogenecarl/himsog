"use client";

import { MapPin, Calendar, Package, Stethoscope, ChevronRight, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, memo } from "react";
import type { Category } from "@/schemas/category.schema";

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
    type: 'SINGLE' | 'PACKAGE';
    pricingModel: 'FIXED' | 'RANGE';
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

interface MobileProviderCardProps {
  provider: Provider;
}

// Mobile loading skeleton
export function MobileProviderCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="flex gap-3 p-3">
        {/* Image skeleton */}
        <div className="w-24 h-24 rounded-xl bg-gray-200 shrink-0" />

        {/* Content skeleton */}
        <div className="flex-1 min-w-0 py-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
          <div className="flex gap-1.5">
            <div className="h-5 bg-gray-200 rounded-full w-16" />
            <div className="h-5 bg-gray-200 rounded-full w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

const MobileProviderCard = memo(function MobileProviderCard({
  provider,
}: MobileProviderCardProps) {
  const [imageError, setImageError] = useState(false);

  // Filter out child services that are part of packages
  const visibleServices = provider.services.filter((service) => {
    if (service.type === 'PACKAGE') return true;

    const isPartOfPackage = provider.services.some(
      (pkg) => pkg.type === 'PACKAGE' &&
        pkg.includedServices.some(
          (included) => included.childService.id === service.id
        )
    );

    return !isPartOfPackage;
  });

  // Get price range for display
  const getPriceDisplay = () => {
    if (visibleServices.length === 0) return null;

    const prices = visibleServices.map(s =>
      s.pricingModel === 'FIXED' ? s.fixedPrice : s.priceMin
    ).filter(p => p > 0);

    if (prices.length === 0) return null;

    const minPrice = Math.min(...prices);
    return `From ₱${minPrice.toLocaleString()}`;
  };

  return (
    <Link href={`/provider-details/${provider.id}`}>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden active:scale-[0.98] transition-transform duration-200">
        <div className="flex gap-3 p-3">
          {/* Image */}
          <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0">
            {provider.coverPhoto && !imageError ? (
              <Image
                loading="eager"
                src={provider.coverPhoto}
                alt={provider.healthcareName}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
                sizes="96px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-300">
                <Calendar className="h-8 w-8" />
              </div>
            )}

            {/* Category badge on image */}
            {provider.category && (
              <div className="absolute bottom-1.5 left-1.5">
                <span
                  className="inline-block px-1.5 py-0.5 text-[9px] font-semibold rounded-md bg-white/90 backdrop-blur-sm text-gray-700"
                >
                  {provider.category.name}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 py-0.5 flex flex-col">
            {/* Title */}
            <h3 className="font-bold text-gray-900 text-sm line-clamp-1 mb-0.5">
              {provider.healthcareName}
            </h3>

            {/* Star Rating */}
            <div className="flex items-center gap-1 mb-1">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const rating = provider.avgRating ?? 0;
                  const isFilled = star <= Math.floor(rating);
                  return (
                    <Star
                      key={star}
                      className={`h-3 w-3 ${isFilled
                          ? "fill-amber-400 text-amber-400"
                          : "fill-gray-200 text-gray-200"
                        }`}
                    />
                  );
                })}
              </div>
              <span className="text-[10px] font-medium text-gray-600">
                {provider.avgRating ? provider.avgRating.toFixed(1) : "0.0"}
              </span>
              <span className="text-[10px] text-gray-400">
                ({provider.totalReviews ?? 0})
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1 text-gray-500 mb-1.5">
              <MapPin className="h-3 w-3 shrink-0" />
              <p className="text-xs line-clamp-1">
                {provider.city}, {provider.province}
              </p>
            </div>

            {/* Services tags */}
            <div className="flex flex-wrap gap-1 mb-1.5">
              {visibleServices.slice(0, 2).map((service) => {
                const isPackage = service.type === 'PACKAGE';
                return (
                  <span
                    key={service.id}
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-medium ${isPackage
                        ? 'bg-purple-50 text-purple-600'
                        : 'bg-blue-50 text-blue-600'
                      }`}
                  >
                    {isPackage ? (
                      <Package className="h-2.5 w-2.5" />
                    ) : (
                      <Stethoscope className="h-2.5 w-2.5" />
                    )}
                    <span className="truncate max-w-[80px]">{service.name}</span>
                  </span>
                );
              })}
              {visibleServices.length > 2 && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 text-gray-500">
                  +{visibleServices.length - 2}
                </span>
              )}
            </div>

            {/* Price and CTA */}
            <div className="flex items-center justify-between mt-auto">
              {getPriceDisplay() && (
                <span className="text-xs font-semibold text-teal-600">
                  {getPriceDisplay()}
                </span>
              )}
              <div className="flex items-center gap-1 text-teal-600">
                <span className="text-xs font-medium">Book</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});

export default MobileProviderCard;

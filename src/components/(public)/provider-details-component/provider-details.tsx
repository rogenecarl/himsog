"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Provider } from "@/schemas/provider.schema";
import type { Category } from "@/schemas/category.schema";
import type { OperatingHour } from "@/schemas/scheduling.schema";
import type { ServiceType, PricingModel } from "@/lib/generated/prisma";
import {
  Star,
  MapPin,
  ShieldCheck,
  ChevronDown,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Building2,
  CalendarCheck,
  MessageSquare,
  ThumbsUp,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatTime24to12 } from "@/lib/utils/time-format";
import { StartConversationButton } from "@/components/messages/start-conversation-button";
import { useProviderReviews, useProviderStats, useToggleReviewLike } from "@/hooks/use-review-hook";
import { useUser } from "@/context/UserContext";
import type { ProviderRatingStats } from "@/schemas/review.schema";

// Type for review items
interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  isAnonymous: boolean;
  createdAt: Date;
  isEdited: boolean;
  providerResponse: string | null;
  respondedAt: Date | null;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
  likeCount: number;
  hasLiked: boolean;
}

// Type for provider details
export type ProviderDetails = Pick<
  Provider,
  | "id"
  | "userId"
  | "healthcareName"
  | "description"
  | "coverPhoto"
  | "phoneNumber"
  | "email"
  | "address"
  | "city"
  | "province"
  | "latitude"
  | "longitude"
> & {
  category: Pick<Category, "id" | "name" | "slug" | "color" | "icon"> | null;
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
  operatingHours: Array<
    Pick<OperatingHour, "id" | "dayOfWeek" | "startTime" | "endTime" | "isClosed">
  >;
};

interface ProviderDetailsContentProps {
  provider: ProviderDetails;
}

// --- SUB-COMPONENTS ---

const HeroSection: React.FC<{ provider: ProviderDetails; stats: ProviderRatingStats | undefined; onBack: () => void }> = ({
  provider,
  stats,
  onBack,
}) => {
  return (
    <div className="relative h-[250px] md:h-[350px] w-full group">
      {provider.coverPhoto ? (
        <Image
          src={provider.coverPhoto}
          alt={provider.healthcareName}
          fill
          className="object-cover"
          priority
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
          <Building2 className="h-24 w-24 text-gray-400" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      {/* Mobile Back Button */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 md:hidden p-2.5 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition active:scale-95 z-10"
        aria-label="Go back"
      >
        <ArrowLeft size={20} />
      </button>

      {/* Desktop Book Appointment Button */}
      <div className="hidden md:block absolute bottom-6 right-6 lg:bottom-8 lg:right-8 z-10">
        <Link href={`/set-appointment/${provider.id}`}>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-base px-6 py-5 rounded-xl shadow-xl shadow-blue-900/40 active:scale-[0.95] transition-all flex items-center gap-2">
            <CalendarCheck className="w-5 h-5" />
            Book Appointment
          </Button>
        </Link>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 max-w-7xl mx-auto text-white">
        <div className="flex items-center gap-2 mb-3">
          {provider.category && (
            <span
              className="px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider shadow-lg"
              style={{ backgroundColor: provider.category.color }}
            >
              {provider.category.name}
            </span>
          )}
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold">
              {stats?.averageRating?.toFixed(1) || "0.0"}
            </span>
            <span className="text-[10px] text-gray-300 ml-1">
              ({stats?.totalReviews || 0} reviews)
            </span>
          </div>
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold leading-tight mb-2 tracking-tight">
          {provider.healthcareName}
        </h1>
        <div className="flex items-start text-gray-300 text-sm font-medium">
          <MapPin className="w-4 h-4 mr-1.5 mt-0.5 flex-shrink-0 text-blue-400" />
          <span>
            {provider.address}, {provider.city}, {provider.province}
          </span>
        </div>
      </div>
    </div>
  );
};

const ServiceCard: React.FC<{
  service: ProviderDetails["services"][0];
  isExpanded: boolean;
  onToggleExpand: () => void;
}> = ({ service, isExpanded, onToggleExpand }) => {
  return (
    <div
      className={`rounded-xl border transition-all duration-300 ${
        service.type === "PACKAGE"
          ? "bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-slate-800 border-purple-100 dark:border-purple-800/50"
          : "bg-white dark:bg-slate-800 border-gray-100 dark:border-white/10 hover:border-blue-200 dark:hover:border-blue-800"
      }`}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            {service.type === "PACKAGE" ? (
              <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                <ShieldCheck className="w-4 h-4" />
              </div>
            ) : (
              <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}
            <div>
              <h4 className="font-bold text-gray-800 dark:text-white text-sm">
                {service.name}
              </h4>
              <p className="text-[10px] font-bold tracking-wider text-gray-400 dark:text-slate-500 uppercase">
                {service.type === "PACKAGE" ? "Package Bundle" : "Single Service"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p
              className={`font-bold text-sm ${
                service.pricingModel === "INQUIRE"
                  ? "text-gray-500 dark:text-slate-400 italic"
                  : service.type === "PACKAGE"
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-blue-600 dark:text-blue-400"
              }`}
            >
              {service.pricingModel === "FIXED"
                ? `₱${service.fixedPrice.toLocaleString()}`
                : service.pricingModel === "RANGE"
                  ? `₱${service.priceMin.toLocaleString()} - ₱${service.priceMax.toLocaleString()}`
                  : "Price upon inquiry"}
            </p>
            <p className="text-[10px] text-gray-400 dark:text-slate-500">
              {service.pricingModel === "FIXED" ? "Fixed Price" : service.pricingModel === "RANGE" ? "Est. Range" : "Contact for pricing"}
            </p>
          </div>
        </div>

        {service.description && (
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-3 line-clamp-2">
            {service.description}
          </p>
        )}

        {/* Insurance Badges */}
        {service.acceptedInsurances.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            <span className="text-[10px] text-gray-400 dark:text-slate-500 mr-1 flex items-center">
              <ShieldCheck className="w-3 h-3 mr-0.5" /> Accepted:
            </span>
            {service.acceptedInsurances.map((ins, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-[10px] font-bold rounded border border-green-100 dark:border-green-800"
              >
                {ins.insuranceProvider.name}
              </span>
            ))}
          </div>
        )}

        {/* Package Expansion */}
        {service.type === "PACKAGE" && service.includedServices.length > 0 && (
          <div className="mt-2 pt-2 border-t border-purple-100/50 dark:border-purple-800/30">
            <button
              onClick={onToggleExpand}
              className="w-full flex items-center justify-between text-xs text-purple-700 dark:text-purple-400 font-medium hover:text-purple-800 dark:hover:text-purple-300"
            >
              <span>Includes {service.includedServices.length} services</span>
              <ChevronDown
                className={`w-3 h-3 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>

            {isExpanded && (
              <ul className="mt-2 space-y-1 bg-white/50 dark:bg-slate-900/50 p-2 rounded-lg">
                {service.includedServices.map((inc, i) => (
                  <li
                    key={i}
                    className="text-xs text-gray-600 dark:text-slate-400 flex items-start gap-1.5"
                  >
                    <div className="w-1 h-1 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                    {inc.childService.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const InfoSidebar: React.FC<{ provider: ProviderDetails }> = ({ provider }) => {
  const today = new Date().getDay(); // 0 = Sunday, 6 = Saturday

  // Day names in order from Sunday (0) to Saturday (6)
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="space-y-6">
      {/* Contact Information Card */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
        <div className="p-4 border-b border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-slate-900/30">
          <h3 className="font-bold text-gray-900 dark:text-white">Contact Information</h3>
        </div>
        <div className="p-5 space-y-5">
          <div className="flex items-start gap-3">
            <div className="mt-1 w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase mb-0.5">
                ADDRESS
              </p>
              <p className="text-sm text-gray-700 dark:text-slate-300 leading-snug">
                {provider.address}, {provider.city}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase mb-0.5">
                PHONE
              </p>
              <p className="text-sm text-gray-700 dark:text-slate-300 font-medium">
                {provider.phoneNumber}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase mb-0.5">
                EMAIL
              </p>
              <p className="text-sm text-gray-700 dark:text-slate-300">
                {provider.email}
              </p>
            </div>
          </div>

          <StartConversationButton
            providerId={provider.userId}
            className="w-full py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          />
        </div>
      </div>

      {/* Operating Hours Card */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
        <div className="p-4 border-b border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-slate-900/30 flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500 dark:text-slate-400" />
          <h3 className="font-bold text-gray-900 dark:text-white">Operating Hours</h3>
        </div>
        <div className="p-5">
          <div className="space-y-3">
            {dayNames.map((dayName, dayIndex) => {
              // Find the schedule for this day (dayOfWeek is stored as 0-6)
              const schedule = provider.operatingHours.find(
                (s) => s.dayOfWeek === dayIndex
              );
              const isToday = today === dayIndex;

              return (
                <div
                  key={dayIndex}
                  className={`flex justify-between items-center text-xs py-2 border-b border-gray-50 dark:border-white/5 last:border-0 ${
                    isToday ? "bg-blue-50 dark:bg-blue-900/20 px-2 rounded-lg -mx-2" : ""
                  }`}
                >
                  <span
                    className={`font-medium ${
                      isToday
                        ? "text-blue-700 dark:text-blue-400"
                        : "text-gray-500 dark:text-slate-400"
                    }`}
                  >
                    {dayName}
                  </span>
                  {!schedule || schedule.isClosed ? (
                    <span className="text-red-400 dark:text-red-400 font-medium">
                      Closed
                    </span>
                  ) : (
                    <span
                      className={`font-medium ${
                        isToday
                          ? "text-blue-700 dark:text-blue-400"
                          : "text-gray-700 dark:text-slate-300"
                      }`}
                    >
                      {formatTime24to12(schedule.startTime ?? "")} -{" "}
                      {formatTime24to12(schedule.endTime ?? "")}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const QuickStats: React.FC<{ provider: ProviderDetails; stats: ProviderRatingStats | undefined }> = ({
  provider,
  stats,
}) => {
  const today = new Date().getDay(); // 0 = Sunday, 6 = Saturday

  const todaysHours = provider.operatingHours.find(
    (h) => h.dayOfWeek === today
  );
  const isOpen = todaysHours && !todaysHours.isClosed;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 mt-4">
      {/* Status */}
      <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 text-center flex flex-col items-center justify-center hover:shadow-md transition-shadow">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
            isOpen
              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
          }`}
        >
          <Clock className="w-5 h-5" />
        </div>
        <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold tracking-widest mb-0.5">
          Current Status
        </p>
        <p
          className={`text-sm font-bold ${
            isOpen
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-500 dark:text-rose-400"
          }`}
        >
          {isOpen ? "Open Now" : "Closed"}
        </p>
      </div>

      {/* Contact */}
      <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 text-center flex flex-col items-center justify-center hover:shadow-md transition-shadow">
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
          <Phone className="w-5 h-5" />
        </div>
        <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold tracking-widest mb-0.5">
          Contact
        </p>
        <p className="text-sm font-bold text-gray-800 dark:text-slate-200 truncate w-full px-2">
          {provider.phoneNumber}
        </p>
      </div>

      {/* Type */}
      <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 text-center flex flex-col items-center justify-center hover:shadow-md transition-shadow">
        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold tracking-widest mb-0.5">
          Type
        </p>
        <p className="text-sm font-bold text-gray-800 dark:text-slate-200">
          {provider.category?.name || "Healthcare"}
        </p>
      </div>

      {/* Reviews */}
      <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 text-center flex flex-col items-center justify-center hover:shadow-md transition-shadow">
        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
          <Star className="w-5 h-5 fill-current" />
        </div>
        <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold tracking-widest mb-0.5">
          Reviews
        </p>
        <p className="text-sm font-bold text-gray-800 dark:text-slate-200">
          {stats?.averageRating?.toFixed(1) || "0.0"} / 5.0
        </p>
      </div>
    </div>
  );
};

const StickyMobileNav: React.FC<{ providerId: string; providerUserId: string }> = ({
  providerId,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1E293B] border-t border-gray-200 dark:border-white/10 p-4 md:hidden z-40 pb-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <Link href={`/set-appointment/${providerId}`}>
        <Button className="w-full bg-blue-600 text-white font-bold text-lg py-5 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
          <CalendarCheck className="w-5 h-5" />
          Book Appointment
        </Button>
      </Link>
    </div>
  );
};

const ReviewSection: React.FC<{
  reviews: ReviewItem[];
  stats: ProviderRatingStats | undefined;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  providerId: string;
}> = ({ reviews, stats, hasMore, isLoading, onLoadMore, providerId }) => {
  const user = useUser();
  const toggleLikeMutation = useToggleReviewLike(providerId);

  const handleLikeToggle = (reviewId: string) => {
    if (!user) return;
    toggleLikeMutation.mutate({ reviewId });
  };

  if (!stats) return null;

  const distribution = [
    { stars: 5, count: stats.ratingDistribution?.[5] || 0 },
    { stars: 4, count: stats.ratingDistribution?.[4] || 0 },
    { stars: 3, count: stats.ratingDistribution?.[3] || 0 },
    { stars: 2, count: stats.ratingDistribution?.[2] || 0 },
    { stars: 1, count: stats.ratingDistribution?.[1] || 0 },
  ];

  return (
    <section className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-white/10">
      <div className="flex items-center gap-2 mb-6">
        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Patient Reviews</h3>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
        {/* Big Rating Number */}
        <div className="text-center md:text-left">
          <h4 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-1">
            {stats.averageRating?.toFixed(1) || "0.0"}
          </h4>
          <div className="flex gap-1 justify-center md:justify-start mb-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {stats.totalReviews || 0} total reviews
          </p>
        </div>

        {/* Progress Bars */}
        <div className="flex-1 w-full space-y-2">
          {distribution.map((item) => (
            <div key={item.stars} className="flex items-center gap-3 text-xs">
              <span className="font-bold text-gray-700 dark:text-slate-300 w-3">
                {item.stars}
              </span>
              <Star className="w-3 h-3 text-gray-300 dark:text-gray-600 fill-gray-300 dark:fill-gray-600" />
              <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      stats.totalReviews > 0
                        ? (item.count / stats.totalReviews) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <span className="text-gray-400 dark:text-slate-500 w-6 text-right">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-slate-900/50 rounded-xl border-dashed border-2 border-gray-200 dark:border-gray-700">
          <MessageSquare className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
          <p className="text-gray-500 dark:text-slate-400 font-medium">
            No written reviews yet
          </p>
          <p className="text-gray-400 dark:text-slate-500 text-sm">
            Be the first to share your experience!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border-b border-gray-50 dark:border-white/5 pb-4 last:border-0"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-300">
                  {review.isAnonymous ? "A" : (review.user?.name?.charAt(0) || "U")}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {review.isAnonymous ? "Anonymous" : (review.user?.name || "Anonymous")}
                  </p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={cn(
                          "w-3 h-3",
                          s <= review.rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-300 dark:text-gray-600 fill-gray-300 dark:fill-gray-600"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  {review.comment}
                </p>
              )}
              {/* Provider Response */}
              {review.providerResponse && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-2 border-blue-500">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                      Provider Response
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-slate-300">
                    {review.providerResponse}
                  </p>
                </div>
              )}
              {/* Like Button */}
              <button
                onClick={() => handleLikeToggle(review.id)}
                disabled={!user || toggleLikeMutation.isPending}
                className={cn(
                  "mt-2 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors",
                  review.hasLiked && "text-blue-600 dark:text-blue-400",
                  !user && "opacity-50 cursor-not-allowed"
                )}
                title={!user ? "Sign in to like reviews" : review.hasLiked ? "Unlike" : "Like"}
              >
                <ThumbsUp
                  className={cn(
                    "w-3.5 h-3.5",
                    review.hasLiked && "fill-blue-600 dark:fill-blue-400"
                  )}
                />
                <span>{review.likeCount || 0}</span>
              </button>
            </div>
          ))}
          {hasMore && (
            <Button
              onClick={onLoadMore}
              disabled={isLoading}
              variant="outline"
              className="w-full text-sm"
            >
              {isLoading ? "Loading..." : "Load More Reviews"}
            </Button>
          )}
        </div>
      )}
    </section>
  );
};

// --- MAIN COMPONENT ---

export default function ProviderDetailsContentComponent({
  provider,
}: ProviderDetailsContentProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedPackages, setExpandedPackages] = useState<Set<string>>(
    new Set()
  );

  const handleBack = () => {
    router.back();
  };

  // Fetch reviews and stats with TanStack Query
  const { data: reviewsData, isLoading: isLoadingReviews } = useProviderReviews(
    {
      providerId: provider.id,
      page: currentPage,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
    }
  );

  const { data: stats } = useProviderStats(provider.id);

  const reviews = reviewsData?.reviews || [];
  const hasMore = reviewsData
    ? reviewsData.pagination.page < reviewsData.pagination.totalPages
    : false;

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const togglePackageExpand = (serviceId: string) => {
    const newExpanded = new Set(expandedPackages);
    if (newExpanded.has(serviceId)) {
      newExpanded.delete(serviceId);
    } else {
      newExpanded.add(serviceId);
    }
    setExpandedPackages(newExpanded);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] pb-24 md:pb-12">
      <HeroSection provider={provider} stats={stats} onBack={handleBack} />

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto -mt-8 relative z-10 px-4">
        {/* Quick Stats Grid */}
        <QuickStats provider={provider} stats={stats} />

        {/* Desktop Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN (Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <section className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-3 mb-5 border-b border-gray-50 dark:border-white/5 pb-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  About {provider.healthcareName}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-slate-400 text-sm md:text-base leading-relaxed">
                {provider.description}
              </p>
            </section>

            {/* Available Services */}
            <section className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-white/10">
              {(() => {
                // Filter services to show only SINGLE and PACKAGE types, excluding services that are part of packages
                const displayedServices = provider.services?.filter((service) => {
                  if (service.type === "PACKAGE") return true;
                  const isPartOfPackage = provider.services.some(
                    (pkg) =>
                      pkg.type === "PACKAGE" &&
                      pkg.includedServices.some(
                        (included) =>
                          included.childService.id === service.id
                      )
                  );
                  return !isPartOfPackage;
                }) || [];

                return (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Available Services
                      </h3>
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                        {displayedServices.length} Services
                      </span>
                    </div>

                    {displayedServices.length === 0 ? (
                      <div className="py-12 text-center">
                        <p className="text-gray-500 dark:text-slate-400">
                          No services available at the moment
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {displayedServices.map((service) => (
                          <ServiceCard
                            key={service.id}
                            service={service}
                            isExpanded={expandedPackages.has(service.id)}
                            onToggleExpand={() => togglePackageExpand(service.id)}
                          />
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </section>

            {/* Reviews Section */}
            <ReviewSection
              reviews={reviews}
              stats={stats}
              hasMore={hasMore}
              isLoading={isLoadingReviews}
              onLoadMore={handleLoadMore}
              providerId={provider.id}
            />
          </div>

          {/* RIGHT COLUMN (Span 1) */}
          <div className="space-y-6">
            <InfoSidebar provider={provider} />
          </div>
        </div>
      </div>

      {/* Mobile Sticky Nav */}
      <StickyMobileNav providerId={provider.id} providerUserId={provider.userId} />
    </div>
  );
}

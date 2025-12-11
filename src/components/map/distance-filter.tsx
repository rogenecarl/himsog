"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Navigation } from "lucide-react";
import { memo } from "react";

export interface DistanceOption {
  id: string;
  label: string;
  value: number | null; // null for "Near me", number for km distances
  icon: React.ReactNode;
  description: string;
}

interface DistanceFilterProps {
  selectedDistance: string;
  onDistanceChange: (distanceId: string) => void;
  userLocation: [number, number] | null;
  isLoading?: boolean;
  className?: string;
}

const DISTANCE_OPTIONS: DistanceOption[] = [
  {
    id: "nearest",
    label: "Near Me",
    value: null,
    icon: <Navigation className="w-4 h-4" />,
    description: "Find closest provider with directions"
  },
  {
    id: "1km",
    label: "Within 1km",
    value: 1,
    icon: <Navigation className="w-4 h-4" />,
    description: "Providers within 1 kilometer"
  },
  {
    id: "3km",
    label: "Within 3km",
    value: 3,
    icon: <Navigation className="w-4 h-4" />,
    description: "Providers within 3 kilometers"
  },
  {
    id: "5km",
    label: "Within 5km",
    value: 5,
    icon: <Navigation className="w-4 h-4" />,
    description: "Providers within 5 kilometers"
  }
];

const DistanceFilter = memo(function DistanceFilter({
  selectedDistance,
  onDistanceChange,
  userLocation,
  isLoading = false,
  className,
}: DistanceFilterProps) {
  if (isLoading) {
    return (
      <div className={cn("flex flex-row gap-2", className)}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-24 bg-slate-200 dark:bg-white/10 rounded-full" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-row gap-2 pb-2", className)}>
      {DISTANCE_OPTIONS.map((option) => {
        const isSelected = selectedDistance === option.id;
        const isDisabled = !userLocation;
        
        const handleClick = () => {
          if (isDisabled) return;
          
          // Toggle behavior: if already selected, deselect (return to "all")
          if (isSelected) {
            onDistanceChange("all");
          } else {
            onDistanceChange(option.id);
          }
        };
        
        return (
          <Button
            key={option.id}
            variant={isSelected ? "default" : "outline"}
            onClick={handleClick}
            disabled={isDisabled}
            className={cn(
              "gap-1.5 h-10 rounded-full shadow-sm transition-all duration-200 shrink-0 whitespace-nowrap px-3 md:px-4",
              isSelected
                ? "text-white hover:opacity-90 bg-blue-600 dark:bg-cyan-500 border-blue-600 dark:border-cyan-500"
                : "bg-white dark:bg-[#1E293B] border-slate-300 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5",
              isDisabled && "opacity-50 cursor-not-allowed"
            )}
            title={isDisabled ? "Location access required" : isSelected ? `Remove ${option.label} filter` : option.description}
          >
            <span className="hidden md:inline">{option.icon}</span>
            <span className="text-xs md:text-sm font-medium">{option.label}</span>
            {option.id === "nearest" && isSelected && (
              <div className="ml-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            )}
          </Button>
        );
      })}
      
      {/* Location Status Indicator - Hidden on mobile */}
      {!userLocation && (
        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-full shrink-0">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
          <span className="text-xs text-amber-700 dark:text-amber-300 font-medium whitespace-nowrap">
            Enable location for distance filters
          </span>
        </div>
      )}
    </div>
  );
});

export default DistanceFilter;
export { DISTANCE_OPTIONS };
"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Stethoscope, X, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchRecommendation {
  providers: string[];
  services: [string, { providerName: string; color: string }][];
}

interface MapSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  recommendations: SearchRecommendation;
  onRecommendationSelect?: (query: string) => void;
  selectedCategory?: string;
  className?: string;
  placeholder?: string;
}

import React from "react";

function MapSearchBar({
  searchQuery,
  onSearchChange,
  recommendations,
  onRecommendationSelect,
  selectedCategory,
  className,
  placeholder,
}: MapSearchBarProps) {
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close recommendations
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowRecommendations(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    onSearchChange(value);
    setShowRecommendations(value.length >= 2);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (searchQuery.length >= 2) {
      setShowRecommendations(true);
    }
  };

  const handleRecommendationClick = (query: string) => {
    onSearchChange(query);
    setShowRecommendations(false);
    setIsFocused(false);
    if (onRecommendationSelect) {
      onRecommendationSelect(query);
    }
  };

  const handleClearSearch = () => {
    onSearchChange("");
    setShowRecommendations(false);
    inputRef.current?.focus();
  };

  const hasRecommendations = 
    recommendations.providers.length > 0 || recommendations.services.length > 0;

  // Dynamic placeholder based on selected category
  const dynamicPlaceholder = placeholder || (selectedCategory 
    ? `Search in ${selectedCategory} category...` 
    : "Search providers, services, or locations...");

  return (
    <div 
      ref={containerRef}
      className={cn("w-full", className)}
    >
      <div className="relative">
        {/* Search Input */}
        <div className={cn(
          "relative bg-white dark:bg-[#1E293B] rounded-full shadow-lg border transition-all duration-200",
          isFocused || showRecommendations 
            ? "border-blue-300 dark:border-cyan-400 shadow-xl" 
            : "border-slate-200 dark:border-white/10"
        )}>
          <Search className="absolute left-3 md:left-4 top-1/2 h-4 w-4 md:h-5 md:w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <Input
            ref={inputRef}
            placeholder={dynamicPlaceholder}
            className="pl-10 md:pl-12 pr-10 md:pr-12 py-6 md:py-3 text-sm md:text-base border-0 rounded-full bg-transparent focus:ring-0 focus:border-0 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            value={searchQuery}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={handleInputFocus}
          />
          {searchQuery && (
            <Button
              onClick={handleClearSearch}
              variant="ghost"
              size="sm"
              className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 h-7 w-7 md:h-8 md:w-8 p-0 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full"
            >
              <X className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-400 dark:text-slate-500" />
            </Button>
          )}
        </div>

        {/* Recommendations Dropdown */}
        {showRecommendations && hasRecommendations && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 overflow-hidden z-60">
            <div className="max-h-80 overflow-y-auto">
              {/* Recommended Services */}
              {recommendations.services.length > 0 && (
                <div className="p-4 border-b border-slate-100 dark:border-white/5">
                  <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                    <Stethoscope className="h-3 w-3" />
                    Services
                  </p>
                  <div className="space-y-2">
                    {recommendations.services.map(([serviceName, serviceData]) => (
                      <button
                        key={serviceName}
                        onClick={() => handleRecommendationClick(serviceName)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm shrink-0"
                          style={{ backgroundColor: serviceData.color }}
                        >
                          <Stethoscope className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-900 dark:text-white truncate">
                            {serviceName}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                            {serviceData.providerName}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Providers */}
              {recommendations.providers.length > 0 && (
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    Healthcare Providers
                  </p>
                  <div className="space-y-2">
                    {recommendations.providers.map((providerName) => (
                      <button
                        key={providerName}
                        onClick={() => handleRecommendationClick(providerName)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                          <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="font-medium text-slate-900 dark:text-white truncate flex-1">
                          {providerName}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(MapSearchBar);
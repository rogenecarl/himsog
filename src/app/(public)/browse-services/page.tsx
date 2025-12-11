"use client";

import { Suspense, useState, useMemo, useCallback, useTransition, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, MapPin, Stethoscope, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CategoryFilter from "@/components/(public)/browse-services/category-filter";
import ProviderCardSkeleton from "@/components/(public)/browse-services/provider-card-skeleton";
import ProviderCard from "@/components/(public)/browse-services/provider-card";
import { useFilteredProviders } from "@/hooks/use-create-provider-profile";
import { useCategories } from "@/hooks/use-category";
import BottomNavigation from "@/components/mobile-bottom-nav";
import MobileHeader from "@/components/mobile-header";
import { useUser } from "@/context/UserContext";

// Loading fallback for Suspense
function BrowseServicesLoading() {
  return (
    <div className="min-h-screen bg-gray-50 sm:bg-white dark:bg-[#0B0F19] text-gray-900 dark:text-white flex flex-col pb-20 sm:pb-8">
      <div className="hidden sm:block w-full px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded-lg w-96 mx-auto animate-pulse" />
        </div>
      </div>
      <div className="flex-1 w-full px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="hidden sm:grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProviderCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrap the page in Suspense for useSearchParams
export default function FindServicesPage() {
  return (
    <Suspense fallback={<BrowseServicesLoading />}>
      <FindServicesContent />
    </Suspense>
  );
}

function FindServicesContent() {
  // URL state management
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const user = useUser();

  const [, startTransition] = useTransition();

  // Initialize state from URL parameters
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Debounced search for server-side filtering
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search query for server-side filtering
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to page 1 on search change
    }, 300);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchQuery]);

  // OPTIMIZED: Server-side filtering with pagination
  const { data: providerResponse, isLoading, error, isFetching } = useFilteredProviders({
    search: debouncedSearch || undefined,
    categorySlug: selectedCategory || undefined,
    page: currentPage,
    limit: 12,
  });

  // Extract providers and pagination from response - memoize to maintain referential equality
  const providers = useMemo(() => providerResponse?.data || [], [providerResponse?.data]);
  const pagination = providerResponse?.pagination;

  // Fetch categories to get category name from slug
  const { data: categories = [] } = useCategories();

  // Get the active category name
  const activeCategoryName = selectedCategory
    ? categories.find((cat) => cat.slug === selectedCategory)?.name || "All Categories"
    : "All Categories";

  // Debounce search updates
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update URL with current filters and page
  const updateURL = useCallback((newSearch: string, newCategory: string, newPage: number, immediate = false) => {
    const updateFn = () => {
      const params = new URLSearchParams();
      if (newSearch) params.set("search", newSearch);
      if (newCategory) params.set("category", newCategory);
      if (newPage > 1) params.set("page", newPage.toString());

      const queryString = params.toString();
      const newURL = queryString ? `${pathname}?${queryString}` : pathname;

      router.replace(newURL, { scroll: false });
    };

    if (immediate) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      updateFn();
    } else {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(updateFn, 300);
    }
  }, [pathname, router]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handle search changes with debounced URL sync
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setShowRecommendations(query.length >= 2);
    updateURL(query, selectedCategory, 1, false);
  }, [selectedCategory, updateURL]);

  // Handle category changes with immediate URL sync
  const handleCategoryChange = useCallback((category: string) => {
    startTransition(() => {
      setSelectedCategory(category);
      setCurrentPage(1); // Reset to page 1 on category change
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      updateURL(searchQuery, category, 1, true);
    });
  }, [searchQuery, updateURL]);

  // Handle page changes
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    updateURL(searchQuery, selectedCategory, newPage, true);
    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [searchQuery, selectedCategory, updateURL]);

  // Server-side filtering - no need for client-side useMemo
  // providers array is already filtered from the server

  // Enhanced recommendations that respect active category - optimized
  const recommendations = useMemo(() => {
    if (searchQuery.length < 2 || !showRecommendations) {
      return {
        providers: [],
        services: [],
      };
    }

    const query = searchQuery.toLowerCase();
    const recommendedProviders = new Set<string>();
    const recommendedServices = new Map<
      string,
      { providerName: string; color: string }
    >();

    // Filter providers by category first if category is selected
    const categoryFilteredProviders = selectedCategory
      ? providers.filter(
          (provider) => provider.category?.slug === selectedCategory
        )
      : providers;

    // Early exit when we have enough recommendations
    for (const provider of categoryFilteredProviders) {
      if (recommendedProviders.size >= 3 && recommendedServices.size >= 4) {
        break;
      }

      // Add provider recommendations
      if (
        recommendedProviders.size < 3 &&
        provider.healthcareName.toLowerCase().includes(query)
      ) {
        recommendedProviders.add(provider.healthcareName);
      }

      // Add service recommendations
      if (recommendedServices.size < 4 && provider.services) {
        for (const service of provider.services) {
          if (recommendedServices.size >= 4) break;
          if (
            service.name.toLowerCase().includes(query) &&
            !recommendedServices.has(service.name)
          ) {
            recommendedServices.set(service.name, {
              providerName: provider.healthcareName,
              color: provider.category?.color || "#3B82F6",
            });
          }
        }
      }
    }

    return {
      providers: Array.from(recommendedProviders).slice(0, 3),
      services: Array.from(recommendedServices.entries()).slice(0, 4),
    };
  }, [searchQuery, providers, selectedCategory, showRecommendations]);

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0B0F19] text-gray-900 dark:text-white flex items-center justify-center">
        <Card className="p-8 max-w-md mx-auto bg-white dark:bg-[#1E293B] border-gray-200 dark:border-white/10">
          <div className="text-center">
            <MapPin className="mx-auto h-12 w-12 text-red-500/50" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              Failed to load providers
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
              There was an error loading healthcare providers. Please try again
              later.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 sm:bg-white dark:bg-[#0B0F19] text-gray-900 dark:text-white flex flex-col pb-20 sm:pb-8">
      {/* Mobile Header */}
      <div className="sm:hidden">
        <MobileHeader
          userName={user?.name || "Guest"}
          subtitle="Browse Services"
          userImage={user?.image}
          showGreeting={!!user}
        />
      </div>

      {/* Desktop Header Section */}
      <div className="hidden sm:block w-full px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-balance text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            Health Care Services in{" "}
            <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Digos City
            </span>
          </h1>
          <p className="pt-2 text-sm sm:text-base font-medium text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
            Find the best health care services in Digos City for your needs
          </p>
        </div>
      </div>

      {/* Search Bar with Recommendations */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 pt-4 sm:pt-0">
        <div className="mx-auto max-w-3xl flex flex-col w-full relative">
          <Search className="absolute left-4 sm:left-5 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          <Input
            placeholder={
              selectedCategory
                ? `Search in ${selectedCategory}...`
                : "Search providers, services"
            }
            className="pl-10 sm:pl-12 pr-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-full h-11 sm:h-12 bg-gray-50 dark:bg-[#1E293B] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() =>
              searchQuery.length >= 2 && setShowRecommendations(true)
            }
            onBlur={() => setTimeout(() => setShowRecommendations(false), 200)}
          />

          {showRecommendations &&
            (recommendations.providers.length > 0 ||
              recommendations.services.length > 0) && (
              <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1E293B] shadow-lg">
                <div className="p-4">
                  {/* Recommended Services */}
                  {recommendations.services.length > 0 && (
                    <div className="mb-4">
                      <p className="mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
                        Services
                      </p>
                      <div className="space-y-2">
                        {recommendations.services.map(
                          ([serviceName, serviceData]: [
                            string,
                            { providerName: string; color: string }
                          ]) => (
                            <button
                              key={serviceName}
                              onClick={() => {
                                setSearchQuery(serviceName);
                                updateURL(serviceName, selectedCategory, 1, true);
                                setShowRecommendations(false);
                              }}
                              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-white/5"
                            >
                              <Stethoscope
                                className="h-4 w-4 shrink-0"
                                style={{ color: serviceData.color }}
                              />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                  {serviceName}
                                </p>
                                <p className="truncate text-xs text-gray-600 dark:text-slate-400">
                                  {serviceData.providerName}
                                </p>
                              </div>
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recommended Providers */}
                  {recommendations.providers.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
                        Providers
                      </p>
                      <div className="space-y-2">
                        {recommendations.providers.map(
                          (providerName: string) => (
                            <button
                              key={providerName}
                              onClick={() => {
                                setSearchQuery(providerName);
                                updateURL(providerName, selectedCategory, 1, true);
                                setShowRecommendations(false);
                              }}
                              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-white/5"
                            >
                              <Search className="h-4 w-4 shrink-0 text-gray-500 dark:text-slate-400" />
                              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                {providerName}
                              </p>
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col w-full">
          {/* Category Filter */}
          <div className="flex justify-center mb-4 sm:mb-8">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>

          {/* Section Header with Category Name and Results Count */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{activeCategoryName}</h2>
            <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-slate-400">
              {pagination ? `${pagination.total} ${pagination.total === 1 ? "result" : "results"} found` : "Loading..."}
              {isFetching && !isLoading && " • Updating..."}
            </span>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <ProviderCardSkeleton key={index} />
              ))}
            </div>
          )}

          {/* Providers Grid */}
          {!isLoading && (
            <>
              {providers.length > 0 ? (
                <>
                  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 ${isFetching ? "opacity-70" : ""}`}>
                    {providers.map((provider) => (
                      <ProviderCard key={provider.id} provider={provider} />
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8 pb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || isFetching}
                        className="gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>

                      <div className="flex items-center gap-1">
                        {/* Page numbers */}
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          let pageNum: number;
                          if (pagination.totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= pagination.totalPages - 2) {
                            pageNum = pagination.totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              disabled={isFetching}
                              className="w-9 h-9 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === pagination.totalPages || isFetching}
                        className="gap-1"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <Card className="flex flex-col items-center justify-center py-16 bg-white dark:bg-[#1E293B] border-gray-200 dark:border-white/10 rounded-2xl">
                  <div className="text-center px-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                      <MapPin className="h-8 w-8 text-gray-400 dark:text-slate-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      No providers found
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                      {debouncedSearch || selectedCategory
                        ? "Try adjusting your search or filters to find what you're looking for."
                        : "No healthcare providers are currently available."}
                    </p>
                  </div>
                </Card>
              )}
            </>
          )}

        </div>
      </div>

      {/* Footer Section */}
      {/* <FindServiceFooterSection /> */}

      {/* Mobile Bottom Navigation */}
      <div className="sm:hidden">
        <BottomNavigation />
      </div>
    </div>
  );
}

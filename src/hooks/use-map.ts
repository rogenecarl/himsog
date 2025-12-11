import React from "react";
import { useQuery } from "@tanstack/react-query";
import { calculateDistance } from "@/lib/distance-utils";
import {
  getAllProvidersForMap,
  getProvidersByCategory,
  searchProvidersForMap,
  type MapProvider
} from "@/actions/map/map-actions";
import { queryConfigDefaults } from "@/lib/query-keys";

// Hook to get all providers for map - OPTIMIZED with queryConfigDefaults
export function useMapProviders() {
  return useQuery({
    queryKey: ["map-providers"],
    queryFn: getAllProvidersForMap,
    ...queryConfigDefaults.static, // Use static config - providers don't change often
  });
}

// Hook to get providers by category for map
export function useMapProvidersByCategory(categorySlug: string) {
  return useQuery({
    queryKey: ["map-providers", "category", categorySlug],
    queryFn: () => getProvidersByCategory(categorySlug),
    enabled: !!categorySlug,
    ...queryConfigDefaults.services,
  });
}

// Hook to search providers for map
export function useMapProvidersSearch(query: string) {
  return useQuery({
    queryKey: ["map-providers", "search", query],
    queryFn: () => searchProvidersForMap(query),
    enabled: query.length >= 2, // Only search if query is at least 2 characters
    ...queryConfigDefaults.services,
  });
}



// Enhanced combined hook for filtered providers (handles category, search, and distance)
export function useFilteredMapProviders(
  searchQuery: string, 
  selectedCategory: string,
  distanceFilter: string = "all",
  userLocation: [number, number] | null = null
) {
  // Get all providers (always fetch as fallback)
  const allProvidersQuery = useMapProviders();

  // Filter the results client-side for better UX and immediate feedback
  const filteredData = React.useMemo(() => {
    // Use all providers as base data for client-side filtering
    let providers = allProvidersQuery.data || [];
    
    if (providers.length === 0) return [];

    // STEP 1: Apply search filter first (if specified)
    if (searchQuery.length >= 2) {
      const query = searchQuery.toLowerCase();
      providers = providers.filter((provider) => {
        return (
          provider.healthcareName.toLowerCase().includes(query) ||
          provider.address.toLowerCase().includes(query) ||
          provider.services?.some((service) =>
            service.name.toLowerCase().includes(query)
          )
        );
      });
    }

    // STEP 2: Apply category filter to search results (if specified)
    if (selectedCategory) {
      providers = providers.filter(
        (provider) => provider.category?.slug === selectedCategory
      );
    }

    // STEP 3: Apply distance filter to the search + category filtered results
    if (distanceFilter !== "all" && userLocation && providers.length > 0) {
      switch (distanceFilter) {
        case "nearest":
          // Find nearest from the current filtered results
          let nearestProvider: (MapProvider & { distance: number }) | null = null;
          let minDistance = Infinity;

          for (const provider of providers) {
            if (!provider.latitude || !provider.longitude) continue;
            
            const distance = calculateDistance(
              userLocation[1],
              userLocation[0],
              provider.latitude,
              provider.longitude
            );
            
            if (distance < minDistance) {
              minDistance = distance;
              nearestProvider = { ...provider, distance };
            }
          }
          
          providers = nearestProvider ? [nearestProvider] : [];
          break;

        case "1km":
        case "3km":
        case "5km":
          // Filter current results by distance
          const maxDist = parseFloat(distanceFilter.replace("km", ""));
          providers = providers
            .map((provider) => {
              if (!provider.latitude || !provider.longitude) return null;
              const distance = calculateDistance(
                userLocation[1],
                userLocation[0],
                provider.latitude,
                provider.longitude
              );
              return distance <= maxDist ? { ...provider, distance } : null;
            })
            .filter((p): p is MapProvider & { distance: number } => p !== null)
            .sort((a, b) => a.distance - b.distance);
          break;
      }
    }

    return providers;
  }, [
    allProvidersQuery.data, 
    searchQuery, 
    selectedCategory, 
    distanceFilter, 
    userLocation
  ]);

  // Get nearest provider from filtered results for auto-directions
  const nearestFromFiltered = React.useMemo(() => {
    if (distanceFilter === "nearest" && filteredData.length > 0) {
      return filteredData[0] as MapProvider & { distance?: number };
    }
    return null;
  }, [distanceFilter, filteredData]);

  // Determine loading state
  const isLoading = allProvidersQuery.isLoading;
  const error = allProvidersQuery.error;

  return {
    data: filteredData,
    isLoading,
    error,
    isError: !!error,
    nearestProvider: nearestFromFiltered,
  };
}

// Enhanced hook for getting recommendations with category awareness - optimized
export function useMapRecommendations(searchQuery: string, selectedCategory?: string) {
  const { data: providers = [] } = useMapProviders();

  return React.useMemo(() => {
    if (searchQuery.length < 2) {
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
      ? providers.filter(provider => provider.category?.slug === selectedCategory)
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
  }, [searchQuery, providers, selectedCategory]);
}

// Export the MapProvider type for use in components
export type { MapProvider };
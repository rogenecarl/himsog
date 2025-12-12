"use client";

import { Suspense, useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Map-specific hooks and components
import {
    useFilteredMapProviders,
    useMapRecommendations,
    type MapProvider,
} from "@/hooks/use-map";
import { toast } from "sonner";

//map components
import { MapSearchBar } from "@/components/map";
import { CategoryFilterMap } from "@/components/map";
import DistanceFilter from "@/components/map/distance-filter";
import { ProviderMarker } from "@/components/map";
import { ProviderPopup } from "@/components/map";
import BottomNavigation from "@/components/mobile-bottom-nav";

// Mapbox style URLs for light and dark modes
// Light: Custom style created in Mapbox Studio
// Dark: Mapbox's built-in dark style (you can replace with a custom dark style from Mapbox Studio)
const MAP_STYLES = {
    light: "mapbox://styles/rogenecarl/cmcoe04d8008l01sq35v2hqdt",
    dark: "mapbox://styles/mapbox/dark-v11",
};

// Loading fallback for map
function MapLoading() {
    return (
        <div className="h-full w-full flex items-center justify-center bg-slate-100 dark:bg-[#0B0F19]">
            <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Loading map...</span>
            </div>
        </div>
    );
}

// Wrap the page in Suspense for useSearchParams
export default function MapPage() {
    return (
        <Suspense fallback={<MapLoading />}>
            <MapContent />
        </Suspense>
    );
}

function MapContent() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const { theme, resolvedTheme } = useTheme();

    // URL state management
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Initialize state from URL parameters
    const [searchQuery, setSearchQuery] = useState(
        searchParams.get("search") || ""
    );
    const [selectedCategory, setSelectedCategory] = useState(
        searchParams.get("category") || ""
    );
    const [selectedDistance, setSelectedDistance] = useState(
        searchParams.get("distance") || "all"
    );
    const [selectedProvider, setSelectedProvider] = useState<MapProvider | null>(
        null
    );
    const [activeProviderId, setActiveProviderId] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(
        null
    );

    // Destination parameters for auto-navigation (from appointments page)
    const destLat = searchParams.get("dest_lat");
    const destLng = searchParams.get("dest_lng");
    const destName = searchParams.get("dest_name");
    const hasAutoNavDestination = destLat && destLng;
    const autoNavTriggered = useRef<boolean>(false);
    const [routeData, setRouteData] = useState<{
        geometry: { coordinates: [number, number][] };
        distance: number;
        duration: number;
        legs?: Array<{
            steps: Array<{
                maneuver: {
                    instruction: string;
                    type: string;
                    modifier?: string;
                };
                distance: number;
                duration: number;
            }>;
        }>;
    } | null>(null);

    // Navigation mode state
    const [isNavigating, setIsNavigating] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [navigationDestination, setNavigationDestination] = useState<[number, number] | null>(null);
    const [distanceToNextTurn, setDistanceToNextTurn] = useState<number | null>(null);
    const [remainingDistance, setRemainingDistance] = useState<number | null>(null);
    const [remainingDuration, setRemainingDuration] = useState<number | null>(null);
    const lastRerouteTime = useRef<number>(0);
    const lastRouteUpdateTime = useRef<number>(0);
    const geolocateControlRef = useRef<mapboxgl.GeolocateControl | null>(null);
    const hasInitialZoom = useRef<boolean>(false);
    const previousUserLocation = useRef<[number, number] | null>(null);
    const navigationWatchId = useRef<number | null>(null);
    const originalRouteCoords = useRef<[number, number][] | null>(null);

    // Helper function to calculate distance between two points (Haversine formula)
    const calculateDistance = useCallback((point1: [number, number], point2: [number, number]): number => {
        const R = 6371e3; // Earth's radius in meters
        const lat1 = (point1[1] * Math.PI) / 180;
        const lat2 = (point2[1] * Math.PI) / 180;
        const deltaLat = ((point2[1] - point1[1]) * Math.PI) / 180;
        const deltaLon = ((point2[0] - point1[0]) * Math.PI) / 180;

        const a =
            Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    }, []);

    // Check if user is off-route (more than 50 meters from any point on the route)
    const isOffRoute = useCallback((userPos: [number, number], routeCoords: [number, number][]): boolean => {
        const OFF_ROUTE_THRESHOLD = 50; // meters

        for (const routePoint of routeCoords) {
            const distance = calculateDistance(userPos, routePoint);
            if (distance < OFF_ROUTE_THRESHOLD) {
                return false; // User is on route
            }
        }
        return true; // User is off route
    }, [calculateDistance]);

    // Find the current step based on user's position
    const findCurrentStep = useCallback((userPos: [number, number], steps: Array<{ maneuver: { instruction: string; type: string; modifier?: string }; distance: number; duration: number }>, routeCoords: [number, number][]): number => {
        if (!steps || steps.length === 0) return 0;

        // Find the closest point on the route
        let minDistance = Infinity;
        let closestIndex = 0;

        for (let i = 0; i < routeCoords.length; i++) {
            const distance = calculateDistance(userPos, routeCoords[i]);
            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = i;
            }
        }

        // Map the route coordinate index to a step index (approximate)
        const stepProgress = closestIndex / routeCoords.length;
        const estimatedStep = Math.floor(stepProgress * steps.length);

        return Math.min(estimatedStep, steps.length - 1);
    }, [calculateDistance]);

    // Find the closest point index on the route to the user
    const findClosestRoutePointIndex = useCallback((userPos: [number, number], routeCoords: [number, number][]): number => {
        let minDistance = Infinity;
        let closestIndex = 0;

        for (let i = 0; i < routeCoords.length; i++) {
            const distance = calculateDistance(userPos, routeCoords[i]);
            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = i;
            }
        }

        return closestIndex;
    }, [calculateDistance]);

    // Calculate total distance along route coordinates
    const calculateRouteDistance = useCallback((coords: [number, number][]): number => {
        let totalDistance = 0;
        for (let i = 0; i < coords.length - 1; i++) {
            totalDistance += calculateDistance(coords[i], coords[i + 1]);
        }
        return totalDistance;
    }, [calculateDistance]);

    // Update the route line to show only remaining portion (trim traveled part)
    const updateRouteLine = useCallback((userPos: [number, number], routeCoords: [number, number][]) => {
        if (!map.current || routeCoords.length < 2) return;

        // Find closest point on route
        const closestIndex = findClosestRoutePointIndex(userPos, routeCoords);

        // Create remaining route from closest point to destination
        // Include user's current position for smooth connection
        const remainingRoute: [number, number][] = [
            userPos,
            ...routeCoords.slice(closestIndex)
        ];

        // Calculate remaining distance
        const remaining = calculateRouteDistance(remainingRoute);
        setRemainingDistance(remaining);

        // Estimate remaining duration (assuming average speed of 30 km/h for driving)
        const avgSpeedMps = 30 * 1000 / 3600; // 30 km/h in meters per second
        setRemainingDuration(remaining / avgSpeedMps);

        // Update the route source with remaining coordinates
        const routeSource = map.current.getSource("route") as mapboxgl.GeoJSONSource;
        if (routeSource) {
            routeSource.setData({
                type: "Feature",
                properties: {},
                geometry: {
                    type: "LineString",
                    coordinates: remainingRoute,
                },
            });
        }

        return closestIndex;
    }, [findClosestRoutePointIndex, calculateRouteDistance]);

    // Calculate bearing between two points for camera rotation
    const calculateBearing = useCallback((from: [number, number], to: [number, number]): number => {
        const lon1 = (from[0] * Math.PI) / 180;
        const lat1 = (from[1] * Math.PI) / 180;
        const lon2 = (to[0] * Math.PI) / 180;
        const lat2 = (to[1] * Math.PI) / 180;

        const dLon = lon2 - lon1;
        const x = Math.sin(dLon) * Math.cos(lat2);
        const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

        const bearing = (Math.atan2(x, y) * 180) / Math.PI;
        return (bearing + 360) % 360;
    }, []);

    // Debounce ref for search input
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Data fetching
    const {
        data: filteredProviders = [],
        error,
        isLoading,
        nearestProvider,
    } = useFilteredMapProviders(
        searchQuery,
        selectedCategory,
        selectedDistance,
        userLocation
    );
    const recommendations = useMapRecommendations(searchQuery, selectedCategory);

    // Cleanup timeout and GPS watch on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            // Stop GPS watching when component unmounts
            if (navigationWatchId.current !== null) {
                navigator.geolocation.clearWatch(navigationWatchId.current);
            }
        };
    }, []);

    // Update URL when search, category, or distance changes
    const updateURL = useCallback((
        newSearch: string,
        newCategory: string,
        newDistance: string
    ) => {
        const params = new URLSearchParams();
        if (newSearch) params.set("search", newSearch);
        if (newCategory) params.set("category", newCategory);
        if (newDistance && newDistance !== "all")
            params.set("distance", newDistance);

        const queryString = params.toString();
        const newURL = queryString ? `${pathname}?${queryString}` : pathname;

        // Use replace to avoid cluttering browser history with every keystroke
        router.replace(newURL);
    }, [pathname, router]);

    // Clear directions and stop navigation
    const clearDirections = useCallback(() => {
        // Stop GPS watching for navigation
        if (navigationWatchId.current !== null) {
            navigator.geolocation.clearWatch(navigationWatchId.current);
            navigationWatchId.current = null;
        }

        if (!map.current) return;

        // Remove route layer and source
        if (map.current.getLayer("route")) {
            map.current.removeLayer("route");
        }
        if (map.current.getSource("route")) {
            map.current.removeSource("route");
        }

        // Reset map view when exiting navigation
        map.current.easeTo({
            pitch: 0,
            bearing: 0,
            zoom: 16,
            duration: 500,
        });

        // Stop navigation mode
        setIsNavigating(false);
        setNavigationDestination(null);
        setCurrentStepIndex(0);
        setRouteData(null);
        setDistanceToNextTurn(null);
        setRemainingDistance(null);
        setRemainingDuration(null);

        // Reset tracking refs
        previousUserLocation.current = null;
        originalRouteCoords.current = null;
        lastRerouteTime.current = 0;
        lastRouteUpdateTime.current = 0;
    }, []);

    // Handle search changes with debounced URL sync
    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query);

        // Reset distance filter when search changes significantly (indicates new exploration intent)
        // Only reset if user is typing a new search (not just clearing)
        let newDistance = selectedDistance;
        if (query.length >= 2 && selectedDistance === "nearest") {
            // Reset "Near Me" when user starts a new search - they want to see all search results
            newDistance = "all";
            setSelectedDistance(newDistance);

            // Clear selected provider when search context changes significantly
            setSelectedProvider(null);
            setActiveProviderId(null);
        }

        // Debounce URL update to reduce navigation calls during typing
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            updateURL(query, selectedCategory, newDistance);
        }, 300);

        // Clear directions when search changes (indicates new search intent)
        if (routeData) {
            clearDirections();
        }
    }, [selectedDistance, selectedCategory, routeData, clearDirections, updateURL]);

    // Handle category changes with URL sync
    const handleCategoryChange = useCallback((category: string) => {
        setSelectedCategory(category);

        // Reset distance filter when category changes (indicates new exploration intent)
        // User wants to see all providers in the new category, not maintain distance constraint
        const resetDistance = "all";
        setSelectedDistance(resetDistance);
        updateURL(searchQuery, category, resetDistance);

        // Clear selected provider and popup when category changes (context change)
        setSelectedProvider(null);
        setActiveProviderId(null);

        // Clear directions when user changes category (indicates new search intent)
        if (routeData) {
            clearDirections();
        }

        // Zoom out to Digos City center at zoom 14 for better overview of category providers
        if (map.current) {
            map.current.flyTo({
                center: [125.3544, 6.7492], // Digos City center
                zoom: 13,
                duration: 800,
            });
        }
    }, [searchQuery, routeData, clearDirections, updateURL]);

    // Handle distance changes with URL sync
    const handleDistanceChange = useCallback((distance: string) => {
        setSelectedDistance(distance);
        updateURL(searchQuery, selectedCategory, distance);

        // Clear selected provider and popup when distance filter changes (context change)
        // Especially important when toggling "Near Me" off - user wants to explore all options
        setSelectedProvider(null);
        setActiveProviderId(null);

        // Clear directions when user changes distance filter (indicates new search intent)
        if (routeData) {
            clearDirections();
        }
    }, [searchQuery, selectedCategory, routeData, clearDirections, updateURL]);

    // Calculate provider counts by category
    const providerCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredProviders.forEach((provider) => {
            if (provider.category?.slug) {
                counts[provider.category.slug] =
                    (counts[provider.category.slug] || 0) + 1;
            }
        });
        return counts;
    }, [filteredProviders]);

    // Initialize Mapbox
    useEffect(() => {
        if (map.current) return; // Initialize map only once

        const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

        if (!mapboxToken) {
            console.error("Mapbox access token is not set");
            return;
        }

        mapboxgl.accessToken = mapboxToken;

        if (mapContainer.current) {
            // Use light as default, theme change effect will update it
            const mapStyle = MAP_STYLES.light;

            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: mapStyle,
                center: [125.3544, 6.7492], // Digos City coordinates
                zoom: 15, // Closer initial zoom for better visibility
            });

            // Add geolocation control to automatically get user location
            const geolocateControl = new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true,
                },
                trackUserLocation: true,
                showUserHeading: true,
                showAccuracyCircle: false,
            });

            map.current.addControl(geolocateControl, "top-right");

            // Wait for map to load before adding controls and triggering geolocation
            map.current.on("load", () => {
                // Automatically trigger geolocation on load
                setTimeout(() => {
                    geolocateControl.trigger();
                }, 1000);
            });

            // Store reference to geolocate control for navigation
            geolocateControlRef.current = geolocateControl;

            // Listen for geolocation events - this fires continuously when tracking
            geolocateControl.on("geolocate", (e: GeolocationPosition) => {
                const userCoords: [number, number] = [
                    e.coords.longitude,
                    e.coords.latitude,
                ];
                setUserLocation(userCoords);

                // Zoom to user location on first location acquisition
                if (map.current && !hasInitialZoom.current) {
                    hasInitialZoom.current = true;
                    map.current.flyTo({
                        center: userCoords,
                        zoom: 16, // Street-level zoom for clear visibility
                        duration: 1200,
                        essential: true
                    });
                }
            });

            geolocateControl.on("error", () => {
                toast.error(
                    "Location access denied. You can still view providers but directions will not be available."
                );
            });

            // Close popup when clicking on map (not on markers)
            map.current.on("click", (e) => {
                // Check if click was on a marker by checking if the target has marker classes
                const clickedElement = e.originalEvent.target as HTMLElement;
                const isMarkerClick =
                    clickedElement.closest(".marker-content") ||
                    clickedElement.classList.contains("marker-content");

                if (!isMarkerClick) {
                    setSelectedProvider(null);
                    setActiveProviderId(null);
                }
            });
        }

        // Cleanup function
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    // Handle theme changes and update map style dynamically
    useEffect(() => {
        if (!map.current) return;

        const currentTheme = resolvedTheme || theme || 'light';
        const newStyle = MAP_STYLES[currentTheme as 'light' | 'dark'] || MAP_STYLES.light;

        // Wait for map to be fully loaded before checking/changing style
        if (!map.current.isStyleLoaded()) {
            // If style is not loaded yet, wait for it
            map.current.once('load', () => {
                if (map.current) {
                    updateMapStyle(currentTheme, newStyle);
                }
            });
        } else {
            updateMapStyle(currentTheme, newStyle);
        }

        function updateMapStyle(theme: string, styleUrl: string) {
            if (!map.current) return;

            try {
                const currentStyle = map.current.getStyle();
                
                // Check if we need to change the style
                if (currentStyle && currentStyle.sprite && !currentStyle.sprite.includes(theme)) {
                    // Store current map state before changing style
                    const center = map.current.getCenter();
                    const zoom = map.current.getZoom();
                    const bearing = map.current.getBearing();
                    const pitch = map.current.getPitch();

                    // Change the map style
                    map.current.setStyle(styleUrl);

                    // Restore map state after style loads
                    map.current.once('style.load', () => {
                        if (map.current) {
                            map.current.setCenter(center);
                            map.current.setZoom(zoom);
                            map.current.setBearing(bearing);
                            map.current.setPitch(pitch);
                        }
                    });
                }
            } catch (error) {
                console.error('Error updating map style:', error);
            }
        }
    }, [theme, resolvedTheme]);

    // Handle provider marker click
    const handleMarkerClick = useCallback((provider: MapProvider) => {
        setSelectedProvider(provider);
        setActiveProviderId(provider.id);

        // Fly to provider location with closer zoom
        if (map.current && provider.latitude && provider.longitude) {
            map.current.flyTo({
                center: [provider.longitude, provider.latitude],
                zoom: 15, // Close zoom to see provider clearly
                duration: 800,
            });
        }
    }, []);

    // Handle search recommendation selection
    const handleRecommendationSelect = useCallback((query: string) => {
        setSearchQuery(query);
        updateURL(query, selectedCategory, selectedDistance);

        // Clear directions when search changes
        if (routeData) {
            clearDirections();
        }
    }, [selectedCategory, selectedDistance, routeData, clearDirections, updateURL]);

    // Get directions from user location to provider
    const getDirections = useCallback(async (
        destination: [number, number],
        isAutoTriggered = false,
        startNavigation = false,
        fromLocation?: [number, number]
    ) => {
        const startPoint = fromLocation || userLocation;

        if (!startPoint || !map.current) {
            toast.error(
                "Location not available. Please allow location access to get directions."
            );
            return;
        }

        try {
            const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
            const start = startPoint;
            const end = destination;

            if (!isAutoTriggered && !startNavigation) {
                toast.loading("Getting directions...", { id: "directions" });
            }

            const query = await fetch(
                `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&voice_instructions=true&banner_instructions=true&access_token=${mapboxToken}`,
                { method: "GET" }
            );

            if (!query.ok) {
                throw new Error("Failed to fetch directions");
            }

            const json = await query.json();

            if (!json.routes || json.routes.length === 0) {
                throw new Error("No route found");
            }

            const data = json.routes[0];
            const route = data.geometry.coordinates;

            if (map.current.getSource("route")) {
                (map.current.getSource("route") as mapboxgl.GeoJSONSource).setData({
                    type: "Feature",
                    properties: {},
                    geometry: {
                        type: "LineString",
                        coordinates: route,
                    },
                });
            } else {
                map.current.addLayer({
                    id: "route",
                    type: "line",
                    source: {
                        type: "geojson",
                        data: {
                            type: "Feature",
                            properties: {},
                            geometry: {
                                type: "LineString",
                                coordinates: route,
                            },
                        },
                    },
                    layout: {
                        "line-join": "round",
                        "line-cap": "round",
                    },
                    paint: {
                        "line-color": "#3B82F6",
                        "line-width": 6,
                        "line-opacity": 0.85,
                    },
                });
            }

            // No green origin marker - the Mapbox GeolocateControl already shows user location

            setRouteData(data);

            // If starting navigation mode
            if (startNavigation) {
                setIsNavigating(true);
                setNavigationDestination(destination);
                setCurrentStepIndex(0);
                toast.success("Navigation started!", { id: "directions" });
            } else if (!isAutoTriggered) {
                toast.success("Directions loaded successfully!", { id: "directions" });
            } else {
                toast.dismiss("directions");
            }
        } catch (error) {
            console.error("Error getting directions:", error);
            toast.error("Failed to get directions. Please try again.", {
                id: "directions",
            });
        }
    }, [userLocation]);

    // Auto-trigger directions for "Near Me" filter
    useEffect(() => {
        if (selectedDistance === "nearest" && nearestProvider && userLocation) {
            // Automatically get directions to nearest provider
            if (nearestProvider.latitude && nearestProvider.longitude) {
                setSelectedProvider(nearestProvider);
                setActiveProviderId(nearestProvider.id);

                // Fly to nearest provider with close zoom
                if (map.current) {
                    map.current.flyTo({
                        center: [nearestProvider.longitude, nearestProvider.latitude],
                        zoom: 15,
                        duration: 800,
                    });
                }

                // Get directions automatically (mark as auto-triggered, no toast from getDirections)
                getDirections(
                    [nearestProvider.longitude, nearestProvider.latitude],
                    true
                );
            }
        }
    }, [selectedDistance, nearestProvider, userLocation, getDirections]);

    // Start navigation with live tracking
    const startNavigation = useCallback((destination: [number, number]) => {
        if (!userLocation) {
            toast.error("Location not available. Please enable location access.");
            return;
        }

        // Clear any existing watch
        if (navigationWatchId.current !== null) {
            navigator.geolocation.clearWatch(navigationWatchId.current);
            navigationWatchId.current = null;
        }

        // Check if geolocation is supported
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser.");
            // Still proceed with navigation using GeolocateControl only
        } else {
            // Start high-frequency GPS watching for live navigation
            navigationWatchId.current = navigator.geolocation.watchPosition(
                (position) => {
                    const newLocation: [number, number] = [
                        position.coords.longitude,
                        position.coords.latitude,
                    ];
                    setUserLocation(newLocation);
                },
                (error) => {
                    // Handle specific error codes
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            console.warn("Navigation GPS: Permission denied");
                            // Don't show toast - user already denied, GeolocateControl will handle it
                            break;
                        case error.POSITION_UNAVAILABLE:
                            console.warn("Navigation GPS: Position unavailable");
                            // Position unavailable, but GeolocateControl might still work
                            break;
                        case error.TIMEOUT:
                            // Timeout is common, don't spam the user - GPS will retry automatically
                            console.warn("Navigation GPS: Timeout, retrying...");
                            break;
                        default:
                            console.warn("Navigation GPS error:", error.message);
                            break;
                    }
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 1000, // Allow 1 second old cached position for smoother updates
                    timeout: 10000, // 10 second timeout (more lenient)
                }
            );
        }

        // Ensure the GeolocateControl is actively tracking (for the blue dot)
        // This is the primary location source - more reliable than raw watchPosition
        if (geolocateControlRef.current) {
            geolocateControlRef.current.trigger();
        }

        // Zoom to user location for navigation view
        if (map.current) {
            map.current.flyTo({
                center: userLocation,
                zoom: 18, // Closer street-level zoom for navigation
                pitch: 60, // Higher tilt for better 3D navigation feel
                bearing: 0,
                duration: 1000,
            });
        }

        // Get directions and start navigation mode
        getDirections(destination, false, true);
    }, [userLocation, getDirections]);

    // Auto-trigger navigation when destination params are provided (from appointments page)
    useEffect(() => {
        if (
            hasAutoNavDestination &&
            userLocation &&
            !autoNavTriggered.current &&
            map.current
        ) {
            autoNavTriggered.current = true;
            const destination: [number, number] = [
                parseFloat(destLng!),
                parseFloat(destLat!),
            ];

            // Show toast with destination name
            if (destName) {
                toast.info(`Getting directions to ${destName}...`, { duration: 2000 });
            }

            // Fly to destination first
            map.current.flyTo({
                center: destination,
                zoom: 15,
                duration: 800,
            });

            // Start navigation after a short delay to let the map settle
            setTimeout(() => {
                startNavigation(destination);
            }, 1000);

            // Clear the URL params to prevent re-triggering on page reload
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.delete("dest_lat");
            newParams.delete("dest_lng");
            newParams.delete("dest_name");
            newParams.delete("dest_id");
            const queryString = newParams.toString();
            const newURL = queryString ? `${pathname}?${queryString}` : pathname;
            router.replace(newURL);
        }
    }, [hasAutoNavDestination, userLocation, destLat, destLng, destName, startNavigation, searchParams, pathname, router]);

    // Handle live navigation updates - route line trimming, camera following, and rerouting
    useEffect(() => {
        if (!isNavigating || !userLocation || !routeData || !navigationDestination) {
            return;
        }

        const routeCoords = routeData.geometry.coordinates;
        const now = Date.now();

        // Calculate distance moved since last update
        const distanceMoved = previousUserLocation.current
            ? calculateDistance(previousUserLocation.current, userLocation)
            : 0;

        // Check if user is off route (more than 50 meters from route)
        if (isOffRoute(userLocation, routeCoords)) {
            // Debounce rerouting (minimum 5 seconds between reroutes)
            if (now - lastRerouteTime.current > 5000) {
                lastRerouteTime.current = now;
                toast.info("Rerouting...", { duration: 2000 });
                getDirections(navigationDestination, true, true, userLocation);
            }
        } else {
            // Live route update: Update route line every 3 meters or every 1 second for smoother experience
            const shouldUpdateRoute = distanceMoved >= 3 || (now - lastRouteUpdateTime.current > 1000);

            if (shouldUpdateRoute) {
                lastRouteUpdateTime.current = now;

                // Trim the route line to show only remaining portion
                updateRouteLine(userLocation, routeCoords);

                // Update camera to follow user with bearing based on movement direction
                if (map.current && previousUserLocation.current && distanceMoved > 1) {
                    const bearing = calculateBearing(previousUserLocation.current, userLocation);

                    // Smooth camera follow with bearing rotation
                    map.current.easeTo({
                        center: userLocation,
                        bearing: bearing,
                        pitch: 60, // Higher pitch for better navigation view
                        zoom: 18, // Closer zoom during navigation
                        duration: 300, // Faster animation for smoother following
                        easing: (t) => t, // Linear easing for smooth following
                    });
                }
            }

            // Update current step and distance to next turn
            if (routeData.legs && routeData.legs[0]?.steps) {
                const steps = routeData.legs[0].steps;
                const newStepIndex = findCurrentStep(userLocation, steps, routeCoords);

                if (newStepIndex !== currentStepIndex) {
                    setCurrentStepIndex(newStepIndex);
                }

                // Calculate distance to next turn (current step's remaining distance)
                if (steps[newStepIndex]) {
                    // Find the maneuver location for current step and calculate distance to it
                    const closestIdx = findClosestRoutePointIndex(userLocation, routeCoords);
                    const stepEndIdx = Math.min(
                        Math.floor((newStepIndex + 1) / steps.length * routeCoords.length),
                        routeCoords.length - 1
                    );

                    // Calculate distance from current position to end of current step
                    let distToTurn = 0;
                    for (let i = closestIdx; i < stepEndIdx && i < routeCoords.length - 1; i++) {
                        distToTurn += calculateDistance(routeCoords[i], routeCoords[i + 1]);
                    }
                    setDistanceToNextTurn(distToTurn);
                }
            }

            // Check if user has reached destination (within 25 meters)
            const distanceToDestination = calculateDistance(userLocation, navigationDestination);
            if (distanceToDestination < 25) {
                toast.success("You have arrived at your destination!", { duration: 5000 });
                clearDirections();
            }
        }

        // Store current location for next comparison
        previousUserLocation.current = userLocation;
    }, [isNavigating, userLocation, routeData, navigationDestination, isOffRoute, getDirections, findCurrentStep, currentStepIndex, calculateDistance, clearDirections, updateRouteLine, calculateBearing, findClosestRoutePointIndex]);

    // Show error state
    if (error) {
        return (
            <div className="h-full w-full relative flex items-center justify-center bg-slate-50 dark:bg-[#0B0F19]">
                <div className="text-center p-8">
                    <div className="text-red-500 dark:text-red-400 mb-4">
                        <svg
                            className="mx-auto h-12 w-12"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        Failed to load map data
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        There was an error loading the healthcare providers. Please try
                        refreshing the page.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        Refresh Page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full relative">
            {/* Map Container */}
            <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

            {/* Top Controls - Search, Category Filter, and Distance Filter */}
            <div className="fixed top-4 md:top-19 left-4 right-4 z-50 flex flex-col">
                {/* Mobile: Search Bar Full Width */}
                <div className="w-full md:hidden pb-2">
                    <MapSearchBar
                        searchQuery={searchQuery}
                        onSearchChange={handleSearchChange}
                        recommendations={recommendations}
                        onRecommendationSelect={handleRecommendationSelect}
                        selectedCategory={selectedCategory}
                        className="relative"
                    />
                </div>

                {/* Desktop: Search Bar and Category Filter in One Row */}
                <div className="hidden md:flex md:flex-row md:items-start md:gap-4 pb-2">
                    {/* Search Bar */}
                    <div className="max-w-2xl">
                        <MapSearchBar
                            searchQuery={searchQuery}
                            onSearchChange={handleSearchChange}
                            recommendations={recommendations}
                            onRecommendationSelect={handleRecommendationSelect}
                            selectedCategory={selectedCategory}
                            className="relative"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="shrink-0">
                        <CategoryFilterMap
                            selectedCategory={selectedCategory}
                            onCategoryChange={handleCategoryChange}
                            providerCounts={providerCounts}
                            className="relative"
                        />
                    </div>
                </div>

                {/* Mobile: Category Filter - Horizontal scroll */}
                <div className="w-full overflow-x-auto scrollbar-hide md:hidden pb-2">
                    <CategoryFilterMap
                        selectedCategory={selectedCategory}
                        onCategoryChange={handleCategoryChange}
                        providerCounts={providerCounts}
                        className="relative"
                    />
                </div>

                {/* Distance Filter - Horizontal scroll on mobile */}
                <div className="w-full overflow-x-auto scrollbar-hide">
                    <DistanceFilter
                        selectedDistance={selectedDistance}
                        onDistanceChange={handleDistanceChange}
                        userLocation={userLocation}
                        isLoading={isLoading}
                        className="relative"
                    />
                </div>
            </div>

            {/* Loading Indicator */}
            {isLoading && (
                <div className="fixed top-40 left-1/2 transform -translate-x-1/2 z-50">
                    <div className="bg-white dark:bg-[#1E293B] rounded-full shadow-lg border border-slate-200 dark:border-white/10 px-4 py-2 flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-cyan-400"></div>
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                            {selectedDistance === "nearest"
                                ? "Finding nearest provider..."
                                : "Loading providers..."}
                        </span>
                    </div>
                </div>
            )}

            {/* No Results Indicator */}
            {!isLoading &&
                filteredProviders.length === 0 &&
                (searchQuery || selectedCategory || selectedDistance !== "all") && (
                    <div className="fixed top-40 left-1/2 transform -translate-x-1/2 z-50">
                        <div className="bg-white dark:bg-[#1E293B] rounded-lg shadow-lg border border-slate-200 dark:border-white/10 px-4 py-3 max-w-sm">
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">No providers found</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {selectedDistance !== "all" && !userLocation
                                            ? "Enable location for distance filters"
                                            : "Try adjusting your search or filters"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            {/* Provider Markers */}
            {map.current &&
                filteredProviders.map((provider) => (
                    <ProviderMarker
                        key={provider.id}
                        map={map.current!}
                        provider={provider}
                        isActive={activeProviderId === provider.id}
                        onClick={handleMarkerClick}
                    />
                ))}

            {/* Provider Popup - Desktop */}
            {map.current && !isNavigating && (
                <ProviderPopup
                    map={map.current}
                    activeProvider={selectedProvider}
                    onGetDirections={(provider) => {
                        if (provider.latitude && provider.longitude) {
                            // Close the popup for better UX when starting navigation
                            setSelectedProvider(null);
                            setActiveProviderId(null);

                            // Start navigation with live tracking
                            startNavigation([provider.longitude, provider.latitude]);
                        } else {
                            toast.error("Provider location not available");
                        }
                    }}
                    userLocation={userLocation}
                />
            )}

            {/* Mobile Bottom Sheet - Provider Details */}
            {selectedProvider && !isNavigating && (
                <div className="md:hidden fixed bottom-16 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
                    <div className="mx-4 mb-2 bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden">
                        <div className="p-4 pb-3">
                            <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-1 line-clamp-2">
                                {selectedProvider.healthcareName}
                            </h3>

                            {/* Location */}
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-1">
                                {selectedProvider.address}, {selectedProvider.city},{" "}
                                {selectedProvider.province}
                            </p>

                            {/* Action Buttons - Prominent */}
                            <div className="flex gap-2">
                                <a
                                    href={`/provider-details/${selectedProvider.id}`}
                                    className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-blue-600 dark:text-cyan-400 bg-white dark:bg-white/5 border-2 border-blue-600 dark:border-cyan-400 rounded-xl transition-colors hover:bg-blue-50 dark:hover:bg-white/10"
                                >
                                    View Details
                                </a>
                                <button
                                    onClick={() => {
                                        if (
                                            selectedProvider.latitude &&
                                            selectedProvider.longitude
                                        ) {
                                            // Start navigation with live tracking
                                            startNavigation(
                                                [selectedProvider.longitude, selectedProvider.latitude]
                                            );
                                        } else {
                                            toast.error("Provider location not available");
                                        }
                                    }}
                                    className="flex-1 inline-flex items-center justify-center cursor-pointer px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors hover:opacity-90 shadow-md bg-green-600 dark:bg-green-500"
                                    title="Start turn-by-turn navigation"
                                >
                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                    Navigate
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Panel - Turn-by-turn directions */}
            {isNavigating && routeData && (
                <div className="fixed top-4 md:top-20 left-4 right-4 z-[60] max-w-md mx-auto">
                    <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
                        {/* Current instruction - prominent */}
                        <div className="bg-blue-600 dark:bg-blue-700 p-4 text-white">
                            <div className="flex items-center gap-3">
                                {/* Direction icon based on maneuver type */}
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                                    {routeData.legs?.[0]?.steps?.[currentStepIndex]?.maneuver?.modifier?.includes('left') ? (
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                    ) : routeData.legs?.[0]?.steps?.[currentStepIndex]?.maneuver?.modifier?.includes('right') ? (
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    ) : (
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-lg font-semibold leading-snug">
                                        {routeData.legs?.[0]?.steps?.[currentStepIndex]?.maneuver?.instruction || 'Continue on route'}
                                    </p>
                                    {/* Live distance to next turn */}
                                    <p className="text-sm text-white/80 mt-0.5">
                                        {distanceToNextTurn !== null
                                            ? distanceToNextTurn >= 1000
                                                ? `${(distanceToNextTurn / 1000).toFixed(1)} km`
                                                : `${Math.round(distanceToNextTurn)} m`
                                            : routeData.legs?.[0]?.steps?.[currentStepIndex]?.distance
                                                ? routeData.legs[0].steps[currentStepIndex].distance >= 1000
                                                    ? `${(routeData.legs[0].steps[currentStepIndex].distance / 1000).toFixed(1)} km`
                                                    : `${Math.round(routeData.legs[0].steps[currentStepIndex].distance)} m`
                                                : ''}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Live trip info and controls */}
                        <div className="p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm">
                                    {/* Live remaining duration */}
                                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="font-medium">
                                            {remainingDuration !== null
                                                ? `${Math.round(remainingDuration / 60)} min`
                                                : `${Math.round(routeData.duration / 60)} min`}
                                        </span>
                                    </div>
                                    {/* Live remaining distance */}
                                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                        </svg>
                                        <span className="font-medium">
                                            {remainingDistance !== null
                                                ? remainingDistance >= 1000
                                                    ? `${(remainingDistance / 1000).toFixed(1)} km`
                                                    : `${Math.round(remainingDistance)} m`
                                                : `${(routeData.distance / 1000).toFixed(1)} km`}
                                        </span>
                                    </div>
                                    {/* Live indicator */}
                                    <div className="flex items-center gap-1">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">LIVE</span>
                                    </div>
                                </div>
                                <button
                                    onClick={clearDirections}
                                    className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg font-medium text-sm hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                >
                                    End
                                </button>
                            </div>

                            {/* Next step preview */}
                            {routeData.legs?.[0]?.steps?.[currentStepIndex + 1] && (
                                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Next</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-1">
                                        {routeData.legs[0].steps[currentStepIndex + 1].maneuver.instruction}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Route Preview Panel - Shows when route loaded but not navigating */}
            {routeData && !isNavigating && !selectedProvider && (
                <div className="fixed bottom-20 md:bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
                    <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-lg border border-slate-200 dark:border-white/10 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-slate-900 dark:text-white">Route Preview</h3>
                            <button
                                onClick={clearDirections}
                                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 mb-3">
                            <div className="flex items-center gap-1.5">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{Math.round(routeData.duration / 60)} min</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                                <span>{(routeData.distance / 1000).toFixed(1)} km</span>
                            </div>
                        </div>
                        {navigationDestination && (
                            <button
                                onClick={() => startNavigation(navigationDestination)}
                                className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                                Start Navigation
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden">
                <BottomNavigation />
            </div>
        </div>
    );
}

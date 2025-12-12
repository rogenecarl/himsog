"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
  MapPin,
  Navigation,
  Target,
} from "lucide-react";
import { useOnboardingCreateProviderProfileStore } from "@/store/create-provider-profile-store";
import Link from "next/link";
import { OnboardingStepper } from "./onboarding-stepper";

// Set Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

// Override schema to ensure all fields are required for form submission
const onboardingLocationFormSchema = z.object({
  address: z.string().min(1, { message: "Address is required" }),
  city: z.string().min(1, { message: "City is required" }),
  province: z.string().min(1, { message: "Province is required" }),
  latitude: z.number(),
  longitude: z.number(),
});

type OnboardingLocationFormType = z.infer<typeof onboardingLocationFormSchema>;

// Default coordinates (Philippines center)
const DEFAULT_LAT = 6.74468;
const DEFAULT_LNG = 125.365847;

// Helper to get initial location from localStorage
const getInitialLocationData = () => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('onboarding-create-provider-profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        const state = parsed.state;
        if (state?.latitude && state?.longitude &&
            state.latitude !== DEFAULT_LAT && state.longitude !== DEFAULT_LNG) {
          return {
            address: state.address || "",
            city: state.city || "",
            province: state.province || "",
            latitude: state.latitude,
            longitude: state.longitude,
          };
        }
      }
    } catch {
      // Ignore parse errors
    }
  }
  return {
    address: "",
    city: "",
    province: "",
    latitude: DEFAULT_LAT,
    longitude: DEFAULT_LNG,
  };
};

export default function OnboardingStep4LocationForm() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const setData = useOnboardingCreateProviderProfileStore(
    (state) => state.setData
  );

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string>("");

  // Get initial location data from localStorage
  const initialLocationData = getInitialLocationData();
  const hasStoredLocation = initialLocationData.latitude !== DEFAULT_LAT ||
                            initialLocationData.longitude !== DEFAULT_LNG;

  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address?: string;
    city?: string;
    province?: string;
  } | null>(() => {
    if (hasStoredLocation) {
      return {
        lat: initialLocationData.latitude,
        lng: initialLocationData.longitude,
        address: initialLocationData.address,
        city: initialLocationData.city,
        province: initialLocationData.province,
      };
    }
    return null;
  });

  const form = useForm<OnboardingLocationFormType>({
    resolver: zodResolver(onboardingLocationFormSchema),
    defaultValues: initialLocationData,
    mode: "onChange",
  });

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const watchedLat = watch("latitude");
  const watchedLng = watch("longitude");

  // Ref to store the latest handleLocationSelect function
  const handleLocationSelectRef = useRef<((lng: number, lat: number, shouldAnimate?: boolean) => void) | undefined>(undefined);

  // Define reverseGeocode as a callback (needed before handleLocationSelect)
  const reverseGeocode = useCallback(async (lng: number, lat: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const context = feature.context || [];

        // Extract address components
        const fullAddress = feature.place_name || "";
        const address = feature.place_name?.split(",")[0] || "";
        const city =
          context.find((c: { id: string; text: string }) => c.id.includes("place"))?.text || "";
        const province =
          context.find((c: { id: string; text: string }) => c.id.includes("region"))?.text || "";

        // Update selectedLocation state for display
        setSelectedLocation((prev) =>
          prev
            ? {
                ...prev,
                address: fullAddress,
                city: city,
                province: province,
              }
            : null
        );

        // Update form values for backend submission
        setValue("address", address);
        setValue("city", city);
        setValue("province", province);
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    }
  }, [setValue]);

  // Define handleLocationSelect as a callback
  const handleLocationSelect = useCallback((
    lng: number,
    lat: number,
    shouldAnimate: boolean = true
  ) => {
    setValue("longitude", lng);
    setValue("latitude", lat);
    setLocationError("");

    // Update selected location for display
    setSelectedLocation({ lat, lng });

    // Reverse geocoding to get address for display
    reverseGeocode(lng, lat);

    // Move existing marker or create new one
    if (markerRef.current && mapRef.current) {
      markerRef.current.setLngLat([lng, lat]);

      // Only animate if requested (for clicks, not drags)
      if (shouldAnimate) {
        // Always zoom to level 13 for consistent view
        const targetZoom = 15;

        // Smooth animation to new location
        mapRef.current.flyTo({
          center: [lng, lat],
          zoom: targetZoom,
          duration: 1500,
          curve: 1.42, // Controls the curve of the flight path
          easing: (t) => t * (2 - t), // Smooth easing function
        });
      }
    } else if (mapRef.current) {
      // Create new marker if it doesn't exist
      const newMarker = new mapboxgl.Marker({
        color: "#3B82F6",
        draggable: true,
      })
        .setLngLat([lng, lat])
        .addTo(mapRef.current);

      // Handle marker drag
      newMarker.on("dragend", () => {
        const newLngLat = newMarker.getLngLat();
        handleLocationSelectRef.current?.(newLngLat.lng, newLngLat.lat, false); // Don't animate on drag
      });

      markerRef.current = newMarker;

      // Animate to initial marker position
      if (shouldAnimate && mapRef.current) {
        mapRef.current.flyTo({
          center: [lng, lat],
          zoom: 15,
          duration: 1500,
          curve: 1.42,
          easing: (t) => t * (2 - t),
        });
      }
    }
  }, [setValue, reverseGeocode]);

  // Keep ref updated with latest handleLocationSelect
  useEffect(() => {
    handleLocationSelectRef.current = handleLocationSelect;
  }, [handleLocationSelect]);

  // Store initial coordinates for map initialization (uses localStorage data if available)
  const initialCoordsRef = useRef({
    lat: initialLocationData.latitude,
    lng: initialLocationData.longitude,
  });

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const { lat, lng } = initialCoordsRef.current;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/rogenecarl/cmcoe04d8008l01sq35v2hqdt",
      center: [lng, lat],
      zoom: 12,
      attributionControl: false,
      logoPosition: "bottom-right",
    });

    mapRef.current.on("load", () => {
      // Add initial marker
      if (mapRef.current) {
        const initialMarker = new mapboxgl.Marker({
          color: "#3B82F6",
          draggable: true,
        })
          .setLngLat([lng, lat])
          .addTo(mapRef.current);

        // Handle marker drag
        initialMarker.on("dragend", () => {
          const newLngLat = initialMarker.getLngLat();
          handleLocationSelectRef.current?.(newLngLat.lng, newLngLat.lat, false); // Don't animate on drag
        });

        markerRef.current = initialMarker;
      }
    });

    // Handle map clicks
    mapRef.current.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      handleLocationSelectRef.current?.(lng, lat, true); // Animate on click
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser");
      return;
    }

    setIsGettingLocation(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        handleLocationSelect(longitude, latitude, true); // Animate to current location
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location access denied by user");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information is unavailable");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out");
            break;
          default:
            setLocationError("An unknown error occurred");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const onSubmit = (data: OnboardingLocationFormType) => {
    // Ensure all required location data is present
    if (!data.latitude || !data.longitude) {
      setLocationError("Please select a location on the map");
      return;
    }

    setIsNavigating(true);
    setData(data);
    console.log("Form Data for Backend:", data);

    // Navigate to next step
    router.push("/provider/onboarding/summary");
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
      {/* Progress Stepper */}
      <OnboardingStepper currentStep={4} />

      {/* Header Section */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/25">
          <MapPin className="h-7 w-7 text-white" />
        </div>
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl text-slate-900 dark:text-white">
          Business Location
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto text-sm sm:text-base">
          Set your location on the map so patients can find you
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="overflow-hidden border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/50 shadow-sm">
          <CardContent className="p-6">
            {/* Map Controls Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                  <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Pin Your Location</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Click map or use current location</p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="gap-2 border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20"
              >
                {isGettingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
                {isGettingLocation ? "Detecting..." : "Use My Location"}
              </Button>
            </div>

            {/* Map Container */}
            <div className="relative h-[350px] sm:h-[400px] w-full overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
              <div ref={mapContainerRef} className="h-full w-full" />

              {/* Map Overlay with Coordinates */}
              <div className="absolute top-3 left-3 rounded-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-3 py-2 text-xs font-mono shadow-lg border border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <MapPin className="h-3 w-3 text-green-500" />
                  <span>{watchedLat.toFixed(5)}, {watchedLng.toFixed(5)}</span>
                </div>
              </div>

              {/* Click instruction overlay */}
              {!selectedLocation && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/80 backdrop-blur-sm px-4 py-2 text-xs text-white shadow-lg">
                  Click on the map to set your location
                </div>
              )}
            </div>

            {/* Selected Location Display Panel */}
            {selectedLocation && (
              <div className="mt-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 border border-green-100 dark:border-green-800/30">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-medium text-green-900 dark:text-green-100">
                    Selected Location
                  </h4>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 text-sm">
                  {selectedLocation.address && (
                    <div className="col-span-2 flex gap-2">
                      <span className="text-green-700 dark:text-green-300 font-medium shrink-0">Address:</span>
                      <span className="text-green-800 dark:text-green-200">{selectedLocation.address}</span>
                    </div>
                  )}
                  {selectedLocation.city && (
                    <div className="flex gap-2">
                      <span className="text-green-700 dark:text-green-300 font-medium">City:</span>
                      <span className="text-green-800 dark:text-green-200">{selectedLocation.city}</span>
                    </div>
                  )}
                  {selectedLocation.province && (
                    <div className="flex gap-2">
                      <span className="text-green-700 dark:text-green-300 font-medium">Province:</span>
                      <span className="text-green-800 dark:text-green-200">{selectedLocation.province}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location Error */}
            {locationError && (
              <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 p-3 flex items-center gap-2">
                <Info className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                <p className="text-xs text-red-700 dark:text-red-300">{locationError}</p>
              </div>
            )}

            {/* Validation Message */}
            {!selectedLocation && (
              <div className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 p-3 flex items-center gap-2">
                <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">Please select a location on the map to continue</p>
              </div>
            )}

            {/* Info Tip */}
            <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-100 dark:border-white/5">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Location Tips</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Drag the marker to fine-tune your exact location. A precise location helps patients navigate to your practice easily.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4">
          <Link href="/provider/onboarding/step-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="border-slate-300 dark:border-white/10"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <Button
            type="submit"
            size="lg"
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-200"
            disabled={!selectedLocation || !!errors.latitude || !!errors.longitude || isNavigating}
          >
            {isNavigating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Continue to Summary
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

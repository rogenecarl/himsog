"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
  MapPin,
  Navigation,
} from "lucide-react";
import { useOnboardingCreateProviderProfileStore } from "@/store/create-provider-profile-store";
import Link from "next/link";

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
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address?: string;
    city?: string;
    province?: string;
  } | null>(null);

  const form = useForm<OnboardingLocationFormType>({
    resolver: zodResolver(onboardingLocationFormSchema),
    defaultValues: {
      address: "",
      city: "",
      province: "",
      longitude: 125.365847, // Default to Philippines center
      latitude: 6.74468,
    },
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

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/rogenecarl/cmcoe04d8008l01sq35v2hqdt",
      center: [watchedLng, watchedLat],
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
          .setLngLat([watchedLng, watchedLat])
          .addTo(mapRef.current);

        // Handle marker drag
        initialMarker.on("dragend", () => {
          const newLngLat = initialMarker.getLngLat();
          handleLocationSelect(newLngLat.lng, newLngLat.lat, false); // Don't animate on drag
        });

        markerRef.current = initialMarker;
      }
    });

    // Handle map clicks
    mapRef.current.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      handleLocationSelect(lng, lat, true); // Animate on click
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Remove dependencies to prevent re-rendering

  const handleLocationSelect = (
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
        handleLocationSelect(newLngLat.lng, newLngLat.lat, false); // Don't animate on drag
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
  };

  const reverseGeocode = async (lng: number, lat: number) => {
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
  };

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
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <MapPin className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl text-slate-900 dark:text-white">
          Business Location
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Set your provider location on the map for customers to find you easily
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="overflow-hidden border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800">
          <CardContent className="p-6 sm:p-8">
            {/* Section Header */}
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-2">
                <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Map Location</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Click on the map to set your location
                </p>
              </div>
            </div>

            <div className="space-y-8">
              {/* Map Container */}
              <div className="space-y-4">
                {/* Current Location Button */}
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    className="flex items-center gap-2"
                  >
                    {isGettingLocation ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Navigation className="h-4 w-4" />
                    )}
                    {isGettingLocation
                      ? "Getting Location..."
                      : "Use Current Location"}
                  </Button>
                </div>

                {/* Map */}
                <div className="relative h-80 w-full overflow-hidden rounded-lg border md:h-96">
                  <div ref={mapContainerRef} className="h-full w-full" />

                  {/* Map Overlay with Coordinates */}
                  <div className="absolute top-4 left-4 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-2 text-xs font-mono shadow-md">
                    <div className="text-gray-600">
                      <div>Lat: {watchedLat.toFixed(6)}</div>
                      <div>Lng: {watchedLng.toFixed(6)}</div>
                    </div>
                  </div>
                </div>

                {/* Selected Location Display Panel */}
                {selectedLocation && (
                  <div className="rounded-lg border bg-blue-50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium text-blue-900">
                        Selected Location
                      </h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      {selectedLocation.address && (
                        <div className="flex justify-between">
                          <span className="text-blue-700 font-medium">
                            Address:
                          </span>
                          <span className="text-blue-800 text-right flex-1 ml-2">
                            {selectedLocation.address}
                          </span>
                        </div>
                      )}
                      {selectedLocation.city && (
                        <div className="flex justify-between">
                          <span className="text-blue-700 font-medium">
                            City:
                          </span>
                          <span className="text-blue-800 text-right flex-1 ml-2">
                            {selectedLocation.city}
                          </span>
                        </div>
                      )}
                      {selectedLocation.province && (
                        <div className="flex justify-between">
                          <span className="text-blue-700 font-medium">
                            Province:
                          </span>
                          <span className="text-blue-800 text-right flex-1 ml-2">
                            {selectedLocation.province}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-blue-700 font-medium">
                          Latitude:
                        </span>
                        <span className="text-blue-800 font-mono">
                          {selectedLocation.lat.toFixed(6)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700 font-medium">
                          Longitude:
                        </span>
                        <span className="text-blue-800 font-mono">
                          {selectedLocation.lng.toFixed(6)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Location Error */}
                {locationError && (
                  <Alert className="border-red-200 bg-red-50">
                    <Info className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                      {locationError}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Info Alert */}
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Tip:</strong> Click anywhere on the map to set your
                  location, or use the &quot;Use Current Location&quot; button
                  to automatically detect your position. You can drag the marker
                  to fine-tune your location.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <Link
            href="/provider/onboarding/step-3"
            className="flex items-center justify-center"
          >
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto border-slate-300 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              onClick={() => router.back()}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-700 sm:w-auto"
            disabled={
              !selectedLocation || !!errors.latitude || !!errors.longitude || isNavigating
            }
          >
            {isNavigating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Next: Summary
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

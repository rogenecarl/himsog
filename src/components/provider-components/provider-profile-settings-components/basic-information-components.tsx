"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Store, Phone, Loader2, MapPin, Navigation, Info } from "lucide-react";
import { useUpdateProviderBasicInfo } from "@/hooks/use-update-provider-hook";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Set Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

interface ProviderBasicInformationProps {
  provider: {
    id: string;
    healthcareName: string;
    description: string | null;
    phoneNumber: string | null;
    email: string | null;
    latitude: number | null;
    longitude: number | null;
    address: string | null;
    city?: string | null;
    province?: string | null;
    [key: string]: unknown;
  };
}

export default function ProviderBasicInformation({
  provider,
}: ProviderBasicInformationProps) {
  const updateProvider = useUpdateProviderBasicInfo();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string>("");

  const [formData, setFormData] = useState({
    healthcareName: provider?.healthcareName || "",
    description: provider?.description || "",
    phoneNumber: provider?.phoneNumber || "",
    email: provider?.email || "",
    address: provider?.address || "",
    city: provider?.city || "",
    province: provider?.province || "",
    latitude: provider?.latitude || 7.0731,
    longitude: provider?.longitude || 125.6128,
  });

  const reverseGeocode = useCallback(async (lng: number, lat: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const context = feature.context || [];

        const address = feature.place_name?.split(",")[0] || "";
        const city =
          context.find((c: { id: string; text: string }) => c.id.includes("place"))?.text || "";
        const province =
          context.find((c: { id: string; text: string }) => c.id.includes("region"))?.text || "";

        return { address, city, province };
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    }
    return null;
  }, []);

  const handleLocationSelect = useCallback(async (lng: number, lat: number) => {
    setFormData((prev) => ({ ...prev, longitude: lng, latitude: lat }));
    setLocationError("");
    
    const geocodeResult = await reverseGeocode(lng, lat);
    if (geocodeResult) {
      setFormData((prev) => ({
        ...prev,
        address: geocodeResult.address,
        city: geocodeResult.city,
        province: geocodeResult.province,
      }));
    }

    if (markerRef.current && mapRef.current) {
      markerRef.current.setLngLat([lng, lat]);
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 15,
        duration: 1000,
      });
    }
  }, [reverseGeocode]);

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
        handleLocationSelect(longitude, latitude);
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        setLocationError("Unable to get your location");
        console.log(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  // Initialize map once provider data is loaded
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || !provider) return;

    const initialLng = provider.longitude || 125.6128;
    const initialLat = provider.latitude || 7.0731;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [initialLng, initialLat],
      zoom: 13,
    });

    mapRef.current.on("load", () => {
      if (mapRef.current) {
        const initialMarker = new mapboxgl.Marker({
          color: "#06b6d4",
          draggable: true,
        })
          .setLngLat([initialLng, initialLat])
          .addTo(mapRef.current);

        initialMarker.on("dragend", () => {
          const newLngLat = initialMarker.getLngLat();
          handleLocationSelect(newLngLat.lng, newLngLat.lat);
        });

        markerRef.current = initialMarker;
      }
    });

    mapRef.current.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      handleLocationSelect(lng, lat);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [provider, handleLocationSelect]);

  // Check if form has changes
  const hasChanges = useMemo(() => {
    if (!provider) return false;

    return (
      formData.healthcareName !== (provider.healthcareName || "") ||
      formData.description !== (provider.description || "") ||
      formData.phoneNumber !== (provider.phoneNumber || "") ||
      formData.email !== (provider.email || "") ||
      formData.address !== (provider.address || "") ||
      formData.city !== (provider.city || "") ||
      formData.province !== (provider.province || "") ||
      formData.latitude !== (provider.latitude || 7.0731) ||
      formData.longitude !== (provider.longitude || 125.6128)
    );
  }, [formData, provider]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasChanges) return;

    await updateProvider.mutateAsync({
      healthcareName: formData.healthcareName,
      description: formData.description || undefined,
      phoneNumber: formData.phoneNumber || undefined,
      email: formData.email || undefined,
      address: formData.address || undefined,
      city: formData.city || undefined,
      province: formData.province || undefined,
      latitude: formData.latitude,
      longitude: formData.longitude,
    });
  };

  return (
    <Card className="gap-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Store className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          <CardTitle className="text-slate-900 dark:text-white">Basic Information</CardTitle>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Update your heatlhcare details and contact information
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* healthcare name Name */}
          <div className="space-y-2">
            <Label htmlFor="healthcareName" className="text-slate-700 dark:text-slate-300">Healthcare Name</Label>
            <Input
              id="healthcareName"
              value={formData.healthcareName}
              onChange={(e) =>
                setFormData({ ...formData, healthcareName: e.target.value })
              }
              placeholder="Enter healthcare name"
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-700 dark:text-slate-300">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe your clinics..."
              rows={4}
              maxLength={500}
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
            />
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Maximum 500 characters
            </p>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <h3 className="font-medium text-slate-900 dark:text-white">Contact Information</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-slate-700 dark:text-slate-300">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  placeholder="+63"
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="email@example.com"
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <h3 className="font-medium text-slate-900 dark:text-white">Location</h3>
            </div>

            {/* Search Location Input */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-slate-700 dark:text-slate-300">Search Location</Label>
              <div className="flex gap-2">
                <Input
                  id="address"
                  value={formData.address || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Enter your address"
                  className="flex-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  {isGettingLocation ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Navigation className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Search for your address or drag the marker on the map
              </p>
            </div>

            {/* Map */}
            <div className="relative h-64 w-full overflow-hidden rounded-lg border border-slate-200 dark:border-white/10">
              <div ref={mapContainerRef} className="h-full w-full" />
              <div className="absolute top-2 left-2 rounded-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2 py-1 text-xs font-mono shadow-md">
                <div className="text-slate-600 dark:text-slate-300">
                  <div>Lat: {formData.latitude.toFixed(6)}</div>
                  <div>Lng: {formData.longitude.toFixed(6)}</div>
                </div>
              </div>
            </div>

            {/* Location Error */}
            {locationError && (
              <Alert className="border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
                <Info className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-700 dark:text-red-300">
                  {locationError}
                </AlertDescription>
              </Alert>
            )}

            {/* City and Province */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-slate-700 dark:text-slate-300">City</Label>
                <Input
                  id="city"
                  value={formData.city || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="City"
                  readOnly
                  className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province" className="text-slate-700 dark:text-slate-300">Province</Label>
                <Input
                  id="province"
                  value={formData.province || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, province: e.target.value })
                  }
                  placeholder="Province"
                  readOnly
                  className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-600"
              disabled={!hasChanges || updateProvider.isPending}
            >
              {updateProvider.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

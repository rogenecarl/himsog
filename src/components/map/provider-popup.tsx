"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import mapboxgl from "mapbox-gl";
import { MapProvider } from "@/hooks/use-map";
import { MapPin, Phone, Mail, Star, Package, Stethoscope } from "lucide-react";
import { toast } from "sonner";

interface ProviderPopupProps {
  map: mapboxgl.Map;
  activeProvider: MapProvider | null;
  onGetDirections?: (provider: MapProvider) => void;
  userLocation?: [number, number] | null;
}

function ProviderPopup({
  map,
  activeProvider,
  onGetDirections,
  userLocation,
}: ProviderPopupProps) {
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const [portalContainer] = React.useState(() => document.createElement("div"));

  // Initialize popup on mount
  useEffect(() => {
    if (!map) return;

    // Create a new popup instance
    popupRef.current = new mapboxgl.Popup({
      closeOnClick: false,
      closeButton: true,
      offset: {
        left: [15, 0],
        right: [-15, 0],
        top: [0, 15],
        bottom: [0, -15],
      },
      anchor: "left",
      maxWidth: "320px",
      className: "provider-popup",
    });

    return () => {
      if (popupRef.current) {
        popupRef.current.remove();
      }
    };
  }, [map]);

  // Update popup when activeProvider changes
  useEffect(() => {
    if (!activeProvider || !popupRef.current) {
      // Remove popup if no active provider
      if (popupRef.current) {
        popupRef.current.remove();
      }
      return;
    }

    // Determine the best anchor position based on screen size and provider location
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      // Mobile: Don't use mapbox popup, we'll render a fixed bottom sheet instead
      popupRef.current.remove();
      return;
    }

    // Desktop: position popup to the side
    const mapBounds = map.getBounds();
    const providerLng = activeProvider.longitude!;
    let anchor: "left" | "right" | "top" | "bottom" = "left";

    if (mapBounds) {
      const mapCenter = mapBounds.getCenter();
      anchor = providerLng > mapCenter.lng ? "left" : "right";
    }

    // Update popup anchor
    popupRef.current.options.anchor = anchor;

    // Set popup location and content
    const htmlContent = portalContainer.outerHTML;
    popupRef.current
      .setLngLat([activeProvider.longitude!, activeProvider.latitude!])
      .setHTML(htmlContent)
      .addTo(map);

    // Add event listeners after popup is added to DOM
    const timeoutId = setTimeout(() => {
      const popupElement = document.querySelector(".mapboxgl-popup-content");
      if (popupElement) {
        const directionsButton = popupElement.querySelector(
          "[data-directions-button]"
        ) as HTMLButtonElement;

        if (directionsButton) {
          const handleDirectionsClick = (e: Event) => {
            e.preventDefault();
            e.stopPropagation();

            if (userLocation && onGetDirections) {
              onGetDirections(activeProvider);
            } else {
              toast.error(
                "Location not available. Please allow location access to get directions."
              );
            }
          };

          directionsButton.addEventListener("click", handleDirectionsClick);
        }
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [activeProvider, map, userLocation, onGetDirections, portalContainer]);

  const formatPrice = (service: {
    type: 'SINGLE' | 'PACKAGE';
    pricingModel: 'FIXED' | 'RANGE';
    fixedPrice: number;
    priceMin?: number;
    priceMax?: number;
  }) => {
    if (service.pricingModel === 'FIXED') {
      return service.fixedPrice > 0 ? `₱${service.fixedPrice.toLocaleString()}` : "Contact for pricing";
    } else {
      if (!service.priceMin || !service.priceMax) return "Contact for pricing";
      if (service.priceMin === 0 && service.priceMax === 0) return "Contact for pricing";
      return `₱${service.priceMin.toLocaleString()} - ₱${service.priceMax.toLocaleString()}`;
    }
  };

  return (
    <>
      {activeProvider &&
        createPortal(
          <div className="provider-popup-content bg-white dark:bg-[#1E293B] rounded-xl md:rounded-2xl shadow-lg md:shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden w-full max-w-[340px] md:max-w-[320px]">
            {/* Desktop: Full Details */}
            <div className="hidden md:block p-4 pb-3">
              <div className="flex items-start justify-between mb-2">
                <div
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white"
                  style={{
                    backgroundColor:
                      activeProvider.category?.color || "#3B82F6",
                  }}
                >
                  <span className="mr-1">
                    {activeProvider.category?.icon || "🏥"}
                  </span>
                  {activeProvider.category?.name || "Healthcare"}
                </div>
              </div>

              {/* Provider Name */}
              <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-1 line-clamp-2">
                {activeProvider.healthcareName}
              </h3>

              {/* Location */}
              <div className="flex items-start gap-2 mb-3">
                <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                  {activeProvider.address}, {activeProvider.city},{" "}
                  {activeProvider.province}
                </span>
              </div>

              {/* Contact Info */}
              {(activeProvider.phoneNumber || activeProvider.email) && (
                <div className="space-y-1.5 mb-4">
                  {activeProvider.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {activeProvider.phoneNumber}
                      </span>
                    </div>
                  )}
                  {activeProvider.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-400 truncate">
                        {activeProvider.email}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Services Preview */}
              {activeProvider.services.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Services ({activeProvider.services.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {activeProvider.services.slice(0, 2).map((service) => (
                      <div
                        key={service.id}
                        className="flex justify-between items-center gap-2"
                      >
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          {service.type === 'PACKAGE' ? (
                            <Package className="h-3 w-3 text-purple-500 dark:text-purple-400 shrink-0" />
                          ) : (
                            <Stethoscope className="h-3 w-3 text-blue-500 dark:text-blue-400 shrink-0" />
                          )}
                          <span className="text-sm text-slate-600 dark:text-slate-400 truncate">
                            {service.name}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-500 whitespace-nowrap">
                          {formatPrice(service)}
                        </span>
                      </div>
                    ))}
                    {activeProvider.services.length > 2 && (
                      <div className="text-xs text-slate-500 dark:text-slate-500">
                        +{activeProvider.services.length - 2} more services
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <a
                  href={`/provider-details/${activeProvider.id}`}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90"
                  style={{
                    backgroundColor:
                      activeProvider.category?.color || "#3B82F6",
                  }}
                >
                  View Details
                </a>
                <button
                  data-directions-button="true"
                  className="flex-1 inline-flex items-center justify-center cursor-pointer px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/5 rounded-lg transition-colors hover:bg-slate-200 dark:hover:bg-white/10"
                  title="Show directions on map"
                >
                  Get Directions
                </button>
              </div>
            </div>

            {/* Mobile: Simplified Bottom Sheet */}
            <div className="md:hidden p-4 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-1 line-clamp-2">
                {activeProvider.healthcareName}
              </h3>

              {/* Location*/}
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-1">
                {activeProvider.address}, {activeProvider.city},{" "}
                {activeProvider.province}
              </p>

              {/* Action Buttons - Prominent */}
              <div className="flex gap-2">
                <a
                  href={`/provider-details/${activeProvider.id}`}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-blue-600 dark:text-cyan-400 bg-white dark:bg-white/5 border-2 border-blue-600 dark:border-cyan-400 rounded-xl transition-colors hover:bg-blue-50 dark:hover:bg-white/10"
                >
                  View Details
                </a>
                <button
                  data-directions-button="true"
                  className="flex-1 inline-flex items-center justify-center cursor-pointer px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors hover:opacity-90 shadow-md bg-blue-600 dark:bg-cyan-500"
                  title="Show directions on map"
                >
                  Get Directions
                </button>
              </div>
            </div>
          </div>,
          portalContainer
        )}
    </>
  );
}

export default React.memo(ProviderPopup);

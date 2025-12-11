"use client";

import { useEffect, useRef, memo, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { createPortal } from "react-dom";
import { MapProvider } from "@/hooks/use-map";

interface ProviderMarkerProps {
  map: mapboxgl.Map;
  provider: MapProvider;
  isActive?: boolean;
  onClick?: (provider: MapProvider) => void;
}

const ProviderMarker = memo(function ProviderMarker({ map, provider, isActive = false, onClick }: ProviderMarkerProps) {
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [markerContainer] = useState(() => document.createElement("div"));

  // Memoize click handler
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(provider);
    }
  }, [onClick, provider]);

  useEffect(() => {
    if (!map || !provider.latitude || !provider.longitude) return;

    // Create the marker and add it to the map
    markerRef.current = new mapboxgl.Marker(markerContainer)
      .setLngLat([provider.longitude, provider.latitude])
      .addTo(map);

    // Add click event to the marker element
    markerContainer.addEventListener('click', handleClick);

    // Cleanup function
    return () => {
      markerContainer.removeEventListener('click', handleClick);
      if (markerRef.current) {
        markerRef.current.remove();
      }
    };
  }, [map, provider.latitude, provider.longitude, markerContainer, handleClick]);

  // Update marker style when active state changes
  useEffect(() => {
    if (markerContainer) {
      const markerElement = markerContainer.querySelector('.marker-content');
      if (markerElement) {
        if (isActive) {
          markerElement.classList.add('active');
        } else {
          markerElement.classList.remove('active');
        }
      }
    }
  }, [isActive, markerContainer]);

  // Determine marker size based on screen width
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const markerSize = isMobile ? 25 : 27;
  const fontSize = isMobile ? 11 : 13;

  return (
    <>
      {createPortal(
        <div
          className={`marker-content ${isActive ? 'active' : ''}`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: `${markerSize}px`,
            height: `${markerSize}px`,
            borderRadius: "50%",
            backgroundColor: provider.category?.color || "#3B82F6",
            border: isActive ? "3px solid #ffffff" : "2px solid #ffffff",
            boxShadow: isActive 
              ? "0px 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 4px rgba(59, 130, 246, 0.3)" 
              : "0px 2px 8px rgba(0, 0, 0, 0.2)",
            cursor: "pointer",
            fontSize: `${fontSize}px`,
            color: "#ffffff",
            fontWeight: "bold",
            transition: "all 0.2s ease-in-out",
            transform: isActive ? "scale(1.1)" : "scale(1)",
            zIndex: isActive ? 1000 : 1,
          }}
          title={provider.healthcareName}
        >
          <span style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.3))" }}>
            {provider.category?.icon || "🏥"}
          </span>
        </div>,
        markerContainer
      )}
    </>
  );
});

export default ProviderMarker;
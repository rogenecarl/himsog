"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function CapacitorBackButton() {
  const router = useRouter();

  useEffect(() => {
    // Only run on client and when Capacitor is available
    if (typeof window === "undefined") return;

    let App: typeof import("@capacitor/app").App | null = null;

    const setupBackButton = async () => {
      try {
        // Dynamically import to avoid SSR issues
        const capacitorApp = await import("@capacitor/app");
        App = capacitorApp.App;

        // Listen for the hardware back button
        await App.addListener("backButton", ({ canGoBack }) => {
          if (canGoBack) {
            // Use browser history to go back
            window.history.back();
          } else {
            // If we can't go back, minimize the app (or you could exit)
            App?.minimizeApp();
          }
        });
      } catch {
        // @capacitor/app not installed or not running in Capacitor
        console.log("Capacitor App plugin not available");
      }
    };

    setupBackButton();

    // Cleanup listener on unmount
    return () => {
      App?.removeAllListeners();
    };
  }, [router]);

  return null;
}

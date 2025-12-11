import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "tech.himsog.app",
  appName: "Himsog",
  webDir: "out",
  server: {
    // Load from your production server
    url: "https://himsog.tech",
    cleartext: true,
  },
  android: {
    // Allow mixed content for WebView
    allowMixedContent: true,
  },
  plugins: {
    Geolocation: {
      permissions: ["location"],
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      launchFadeOutDuration: 500,
      backgroundColor: "#1E40AF",
      androidSplashResourceName: "splash_background",
      androidScaleType: "FIT_XY",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;

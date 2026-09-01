import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Azure App Service needs a self-contained server bundle. Vercel builds its
  // own output format, so leaving this on there is redundant at best - it is
  // switched off when building on Vercel.
  output: process.env.VERCEL ? undefined : "standalone",

  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
    // optimizeCss: true, // Enables CSS optimization with critters for inlining critical CSS
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "jknjwfbppfmgokwnrknc.supabase.co",
      },
       {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;

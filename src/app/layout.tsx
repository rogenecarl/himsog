import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/context/QueryProvider";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { CapacitorBackButton } from "@/components/capacitor-back-button";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

const notoSansKR = Noto_Sans_KR({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

// 1. Setup your base URL (Change this to your actual domain when deployed)
const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://himsog.com";

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Helpful for map applications to prevent accidental zooming on mobile inputs
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Himsog | Centralized Healthcare Geolocation System",
    template: "%s | Himsog", // Result: "Veterinarians | Himsog"
  },
  description:
    "Find nearby hospitals, veterinarians, dermatologists, dental clinics, and health centers instantly. The ultimate centralized healthcare map for your medical needs.",
  applicationName: "Himsog",
  authors: [{ name: "Himsog Team" }],
  keywords: [
    "healthcare map",
    "hospitals near me",
    "veterinary clinics",
    "dermatologist",
    "dental clinics",
    "health centers",
    "medical geolocation",
    "emergency services",
  ],
  creator: "Himsog",
  publisher: "Himsog",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Himsog | Find Healthcare Services Near You",
    description:
      "Navigate your way to health. Locate the nearest hospitals, vets, and clinics on our interactive map.",
    url: siteUrl,
    siteName: "Himsog",
    images: [
      {
        url: "/og-image.png", // *Make sure to add this image to your public folder*
        width: 1200,
        height: 630,
        alt: "Himsog Healthcare Map Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Himsog | Healthcare Map",
    description: "Find hospitals, vets, and clinics near you instantly.",
    images: ["/og-image.png"], // Reusing the OG image
    creator: "@himsog", // Change to your twitter handle
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${notoSansKR.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased bg-background text-foreground">
        <CapacitorBackButton />
        <QueryProvider>
          <NextTopLoader
            showSpinner={false}
            height={3}
            color="#06b6d4"
            shadow="0 0 10px #06b6d4,0 0 5px #06b6d4"
          />
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <Toaster richColors position="top-right" />
            <main className="min-h-screen flex flex-col">{children}
              <SpeedInsights />
              <Analytics />
            </main>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

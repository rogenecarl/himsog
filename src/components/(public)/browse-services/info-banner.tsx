"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Baby,
  Users,
  Scale,
  Syringe,
  Clock,
  ArrowRight,
  CheckCircle2,
  Stethoscope,
  HeartPulse,
  Pill,
  Thermometer,
  Activity,
  ChevronLeft,
  ChevronRight,
  Heart,
  Eye,
  Bone,
  Brain,
  Droplet,
  Shield,
  Sparkles,
  type LucideIcon
} from 'lucide-react';
import Link from 'next/link';
import { useHealthCenters } from '@/hooks/use-create-provider-profile';

// Gradient themes for carousel items
const GRADIENT_THEMES = [
  { gradient: 'from-blue-700 via-blue-600 to-teal-500', accent: 'blue' },
  { gradient: 'from-emerald-700 via-teal-600 to-cyan-500', accent: 'emerald' },
  { gradient: 'from-indigo-700 via-purple-600 to-pink-500', accent: 'indigo' },
  { gradient: 'from-cyan-700 via-blue-600 to-indigo-500', accent: 'cyan' },
  { gradient: 'from-teal-700 via-emerald-600 to-green-500', accent: 'teal' },
];

// Service name to icon mapping
const SERVICE_ICON_MAP: Record<string, LucideIcon> = {
  // Maternal and child health
  'prenatal': Baby,
  'pre-natal': Baby,
  'maternal': Baby,
  'pregnancy': Baby,
  'child': Baby,
  'pediatric': Baby,
  'newborn': Baby,
  'infant': Baby,

  // Family planning
  'family planning': Users,
  'planning': Users,
  'counseling': Users,
  'consultation': Stethoscope,

  // Nutrition
  'nutrition': Scale,
  'timbang': Scale,
  'weight': Scale,
  'feeding': Scale,
  'diet': Scale,

  // Immunization
  'immunization': Syringe,
  'vaccine': Syringe,
  'vaccination': Syringe,
  'tetanus': Syringe,
  'anti-rabies': Syringe,
  'rabies': Syringe,

  // General health
  'checkup': Stethoscope,
  'check-up': Stethoscope,
  'general': Stethoscope,
  'examination': Stethoscope,
  'medical': Stethoscope,

  // Cardiovascular
  'blood pressure': HeartPulse,
  'hypertension': HeartPulse,
  'heart': Heart,
  'cardiac': Heart,
  'cardiovascular': HeartPulse,

  // Medications
  'vitamin': Pill,
  'medicine': Pill,
  'medication': Pill,
  'drug': Pill,
  'supplement': Pill,

  // Fever/Temperature
  'fever': Thermometer,
  'temperature': Thermometer,
  'flu': Thermometer,
  'cold': Thermometer,

  // Lab/Diagnostics
  'laboratory': Activity,
  'lab': Activity,
  'test': Activity,
  'sputum': Activity,
  'blood': Droplet,
  'urine': Droplet,

  // Parasites
  'deworming': Activity,
  'parasite': Activity,

  // Eye care
  'eye': Eye,
  'vision': Eye,
  'optical': Eye,

  // Bone/Physical
  'bone': Bone,
  'physical': Bone,
  'therapy': Bone,

  // Mental health
  'mental': Brain,
  'psychological': Brain,
  'counselling': Brain,

  // First aid
  'first aid': CheckCircle2,
  'emergency': CheckCircle2,
  'wound': CheckCircle2,

  // Dental
  'dental': Sparkles,
  'tooth': Sparkles,
  'oral': Sparkles,

  // Health certificate
  'certificate': Shield,
  'clearance': Shield,
};

// Get icon for a service based on its name
function getServiceIcon(serviceName: string): LucideIcon {
  const lowerName = serviceName.toLowerCase();

  for (const [keyword, icon] of Object.entries(SERVICE_ICON_MAP)) {
    if (lowerName.includes(keyword)) {
      return icon;
    }
  }

  // Default icon
  return Stethoscope;
}

// Loading skeleton for the banner
function InfoBannerSkeleton() {
  return (
    <div className="w-full bg-gray-50 sm:bg-white dark:bg-[#0B0F19] pb-2 pt-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-800 shadow-lg animate-pulse min-h-[320px] lg:min-h-[260px]">
          <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-center gap-6 p-5 md:p-8 lg:gap-8">
            <div className="flex-1 text-center lg:text-left min-w-0 md:pl-8 lg:pl-0 space-y-4">
              <div className="h-6 bg-white/20 rounded-full w-48 mx-auto lg:mx-0" />
              <div className="h-10 bg-white/20 rounded-lg w-72 mx-auto lg:mx-0" />
              <div className="h-4 bg-white/20 rounded w-56 mx-auto lg:mx-0" />
              <div className="h-16 bg-white/20 rounded w-full max-w-xl mx-auto lg:mx-0" />
            </div>
            <div className="w-full lg:w-[55%] min-w-0">
              <div className="bg-white/10 rounded-xl p-4 h-40" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const InfoBanner: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch health centers data
  const { data: healthCenters, isLoading } = useHealthCenters();

  // Transform health centers data for the carousel
  const carouselData = useMemo(() => {
    if (!healthCenters || healthCenters.length === 0) return [];

    return healthCenters.map((provider, index) => ({
      id: provider.id,
      title: provider.healthcareName,
      address: `${provider.address}, ${provider.city}`,
      description: provider.description || `Your community partner in health. We provide a wide range of free medical services for all residents of ${provider.city}.`,
      ...GRADIENT_THEMES[index % GRADIENT_THEMES.length],
      services: provider.services.slice(0, 12).map(service => ({
        id: service.id,
        name: service.name,
        icon: getServiceIcon(service.name),
      })),
    }));
  }, [healthCenters]);

  // Compute safe index to handle when data changes
  const safeIndex = carouselData.length > 0 ? currentIndex % carouselData.length : 0;

  // Auto-rotate carousel
  useEffect(() => {
    if (isPaused || carouselData.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselData.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isPaused, carouselData.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % carouselData.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + carouselData.length) % carouselData.length);
  };

  // Show skeleton while loading
  if (isLoading) {
    return <InfoBannerSkeleton />;
  }

  // Don't render if no health centers
  if (carouselData.length === 0) {
    return null;
  }

  const currentItem = carouselData[safeIndex];
  const isBlueTheme = currentItem.accent === 'blue' || currentItem.accent === 'cyan';
  const isEmeraldTheme = currentItem.accent === 'emerald' || currentItem.accent === 'teal';

  return (
    <div
      className="w-full bg-gray-50 sm:bg-white dark:bg-[#0B0F19] pb-2 pt-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${currentItem.gradient} shadow-lg transition-colors duration-700 ease-in-out`}>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[300px] w-[300px] rounded-full bg-white/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-[200px] w-[200px] rounded-full bg-white/10 blur-3xl pointer-events-none" />

          {/* Navigation Arrows */}
          {carouselData.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/10 hover:bg-black/20 text-white backdrop-blur-sm transition-opacity md:block hidden"
                aria-label="Previous slide"
              >
                <ChevronLeft size={24} />
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/10 hover:bg-black/20 text-white backdrop-blur-sm transition-opacity md:block hidden"
                aria-label="Next slide"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-center gap-6 p-5 md:p-8 lg:gap-8 min-h-[320px] lg:min-h-[260px]">

            {/* Text Content */}
            <div className="flex-1 text-center lg:text-left min-w-0 md:pl-8 lg:pl-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[10px] md:text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm border border-white/10 mx-auto lg:mx-0">
                <Clock size={12} />
                <span>Barangay Health Center</span>
              </div>

              <h1 className="mb-2 text-2xl font-extrabold leading-tight tracking-tight text-white md:text-3xl lg:text-4xl animate-fade-in transition-all">
                {currentItem.title}
              </h1>

              <div className="mb-3 flex items-center justify-center lg:justify-start gap-2 text-blue-50">
                <MapPin className="h-4 w-4 flex-shrink-0 text-white/80" />
                <span className="font-medium text-sm">{currentItem.address}</span>
              </div>

              <p className="mb-5 text-sm leading-relaxed text-blue-50 opacity-90 max-w-xl mx-auto lg:mx-0 min-h-[40px] line-clamp-2">
                {currentItem.description}
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <Link href={`/provider-details/${currentItem.id}`}>
                  <button className={`flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-bold shadow-md transition-all hover:bg-white/90 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer ${
                    isBlueTheme ? 'text-blue-700' : isEmeraldTheme ? 'text-emerald-700' : 'text-indigo-700'
                  }`}>
                    <span>View Center</span>
                    <ArrowRight size={16} />
                  </button>
                </Link>
                <div className="hidden sm:flex items-center justify-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                  <CheckCircle2 size={16} className={isBlueTheme ? "text-teal-300" : isEmeraldTheme ? "text-emerald-300" : "text-purple-300"} />
                  <span>Always Free</span>
                </div>
              </div>
            </div>

            {/* Services Container */}
            <div className="w-full lg:w-[55%] min-w-0 md:pr-8 lg:pr-0">
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 md:p-4 transition-all duration-300">
                <div className="flex items-center justify-between mb-2 px-1">
                  <h3 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                    <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-sm">FREE</span>
                    Available Services
                  </h3>
                  {carouselData.length > 1 && (
                    <div className="flex gap-1.5">
                      {carouselData.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentIndex(idx)}
                          aria-label={`Go to slide ${idx + 1}`}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${idx === safeIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Scrollable Services List */}
                <div className="flex gap-2.5 overflow-x-auto pb-2 custom-scrollbar snap-x">
                  {currentItem.services.length > 0 ? (
                    currentItem.services.map((service) => {
                      const ServiceIcon = service.icon;
                      return (
                        <div
                          key={service.id}
                          className="snap-start flex-shrink-0 w-28 md:w-32 bg-white/95 backdrop-blur-xl rounded-lg p-3 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-transform hover:-translate-y-1 cursor-default group"
                        >
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center mb-2 transition-colors ${
                            isBlueTheme
                              ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                              : isEmeraldTheme
                                ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
                                : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
                          }`}>
                            <ServiceIcon size={16} />
                          </div>
                          <span className="text-slate-800 font-bold text-[11px] leading-tight mb-1 line-clamp-2 min-h-[2.4em] flex items-center justify-center w-full">
                            {service.name}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex-1 flex items-center justify-center py-4 text-white/70 text-sm">
                      Services information coming soon
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoBanner;

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useHealthCenters } from '@/hooks/use-create-provider-profile';

// 8s rather than 6s: the previous interval rotated away before the description
// could be read. Auto-advance is suspended on hover, on keyboard focus, and
// entirely when the visitor prefers reduced motion.
const ROTATE_INTERVAL_MS = 8000;

// Services beyond this are summarised as "+N more" rather than pushed into a
// horizontal scroller, so nothing important is hidden behind a swipe.
const MAX_VISIBLE_SERVICES = 8;

function InfoBannerSkeleton() {
  return (
    <div className="w-full bg-gray-50 sm:bg-white dark:bg-[#0B0F19] pb-2 pt-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#1E293B]">
          <div className="absolute inset-y-0 left-0 w-1 bg-slate-200 dark:bg-slate-700" />
          <div className="grid animate-pulse gap-6 p-5 pl-6 sm:p-6 sm:pl-7 lg:grid-cols-12 lg:gap-8 lg:p-7 lg:pl-8">
            <div className="space-y-3 lg:col-span-5">
              <div className="h-6 w-44 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="h-7 w-64 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-52 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-10 w-36 rounded-lg bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="lg:col-span-7">
              <div className="h-full min-h-[168px] rounded-xl bg-slate-100 dark:bg-slate-800" />
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
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const { data: healthCenters, isLoading } = useHealthCenters();

  const centers = useMemo(() => {
    if (!healthCenters || healthCenters.length === 0) return [];

    return healthCenters.map((provider) => {
      // Packages exist to bundle a price, and nothing here has one - listing
      // "Community Health Package" alongside the consultations it already
      // contains just says the same care twice. Show the individual services
      // instead, so every line is something a visitor can actually receive.
      const singleServices = provider.services.filter(
        (service) => service.type !== 'PACKAGE'
      );

      return {
        id: provider.id,
        name: provider.healthcareName,
        address: `${provider.address}, ${provider.city}`,
        description: provider.description,
        services: (singleServices.length > 0 ? singleServices : provider.services).map(
          (service) => ({ id: service.id, name: service.name })
        ),
      };
    });
  }, [healthCenters]);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setPrefersReducedMotion(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const total = centers.length;
  const safeIndex = total > 0 ? currentIndex % total : 0;

  useEffect(() => {
    if (isPaused || prefersReducedMotion || total <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, ROTATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isPaused, prefersReducedMotion, total]);

  if (isLoading) {
    return <InfoBannerSkeleton />;
  }

  if (total === 0) {
    return null;
  }

  const current = centers[safeIndex];
  const visibleServices = current.services.slice(0, MAX_VISIBLE_SERVICES);
  const hiddenServiceCount = current.services.length - visibleServices.length;

  const goTo = (index: number) => setCurrentIndex((index + total) % total);

  return (
    <div className="w-full bg-gray-50 sm:bg-white dark:bg-[#0B0F19] pb-2 pt-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <section
          aria-roledescription="carousel"
          aria-label="Free barangay health centers near you"
          className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#1E293B]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={() => setIsPaused(false)}
        >
          {/* Accent rail: the one piece of ornament, and it carries meaning -
              emerald is already this app's colour for free health-centre care. */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-1 bg-emerald-600 dark:bg-emerald-400"
          />

          <div
            className="grid gap-6 p-5 pl-6 sm:p-6 sm:pl-7 lg:grid-cols-12 lg:items-start lg:gap-8 lg:p-7 lg:pl-8"
            aria-live={isPaused || prefersReducedMotion ? 'polite' : 'off'}
            aria-atomic="true"
          >
            {/* Identity + action */}
            <div className="lg:col-span-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Barangay Health Center
              </span>

              {/* h2, not h1: the browse page owns the h1 below this banner. */}
              <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
                {current.name}
              </h2>

              <p className="mt-2 flex items-start gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{current.address}</span>
              </p>

              {current.description && (
                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {current.description}
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <Link
                  href={`/provider-details/${current.id}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  View center
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>

                {/* Controls live here so they are reachable at every breakpoint -
                    the previous arrows were hidden below md, leaving mobile
                    visitors with no way to move between centres. */}
                {total > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => goTo(safeIndex - 1)}
                      aria-label="Previous health center"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      {centers.map((center, index) => (
                        <button
                          key={center.id}
                          type="button"
                          onClick={() => goTo(index)}
                          aria-label={`Show ${center.name}`}
                          aria-current={index === safeIndex}
                          className={`h-2 rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${
                            index === safeIndex
                              ? 'w-5 bg-emerald-600 dark:bg-emerald-400'
                              : 'w-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => goTo(safeIndex + 1)}
                      aria-label="Next health center"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Free services - the reason this banner exists, so it is fully
                visible rather than tucked into a horizontal scroller. */}
            <div className="lg:col-span-7">
              <div className="h-full rounded-xl border border-emerald-600/15 bg-emerald-50/70 p-4 sm:p-5 dark:border-emerald-400/20 dark:bg-emerald-400/5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                  Free services
                  <span className="rounded-full bg-emerald-600/10 px-1.5 py-0.5 text-xs font-medium tabular-nums text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
                    {current.services.length}
                  </span>
                </h3>

                {visibleServices.length > 0 ? (
                  <>
                    <ul className="mt-3 grid gap-x-5 gap-y-2 sm:grid-cols-2">
                      {visibleServices.map((service) => (
                        <li
                          key={service.id}
                          className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
                        >
                          <Check
                            className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                            strokeWidth={2.5}
                            aria-hidden="true"
                          />
                          <span className="min-w-0">{service.name}</span>
                        </li>
                      ))}
                    </ul>

                    {hiddenServiceCount > 0 && (
                      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                        +{hiddenServiceCount} more free{' '}
                        {hiddenServiceCount === 1 ? 'service' : 'services'} at this center
                      </p>
                    )}
                  </>
                ) : (
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    Service details for this center are coming soon.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default InfoBanner;

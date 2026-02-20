"use client";

import React from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  ArrowRight,
  Activity,
  Clock,
  Star,
  Shield,
  CalendarCheck,
} from "lucide-react";
import { motion } from "framer-motion";

const Hero: React.FC = () => {
  return (
    <section className="relative pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-screen flex flex-col justify-center">
      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Top section - Text content */}
        <div className="text-center max-w-4xl mx-auto mb-16 lg:mb-20">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/40 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
            </span>
            <span className="text-xs font-semibold text-teal-700 dark:text-teal-300 tracking-wide">
              Now live in Digos City
            </span>
            <ArrowRight className="w-3 h-3 text-teal-500" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-slate-900 dark:text-white tracking-tight mb-8 leading-[1.1] md:leading-[1.1]"
          >
            Find Nearby <br className="hidden md:block" />
            <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-500 dark:from-teal-400 dark:via-cyan-400 dark:to-teal-300">
                Healthcare Services
              </span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
                className="absolute bottom-1 left-0 right-0 h-3 bg-teal-200/40 dark:bg-teal-800/30 rounded-full origin-left -z-0"
              />
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-base sm:text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            The all-in-one platform connecting Digos City patients with providers.
            Real-time mapping, AI assistance, and booking features.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            <Link
              href="/browse-services"
              className="w-full sm:w-auto group flex items-center justify-center gap-2.5 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-950 font-semibold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-teal-600/25 dark:shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-600/30 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              Browse Services
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/map"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-white/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 font-semibold px-7 py-3.5 rounded-xl transition-all backdrop-blur-sm hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <MapPin className="w-4 h-4" />
              Explore Map
            </Link>
          </motion.div>
        </div>

        {/* Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            delay: 0.5,
            type: "spring",
            stiffness: 40,
            damping: 20,
          }}
          className="relative mx-auto max-w-5xl"
        >
          {/* Glow behind the card */}
          <div className="absolute inset-0 bg-gradient-to-b from-teal-500/10 via-cyan-500/5 to-transparent dark:from-teal-500/5 dark:via-cyan-500/3 rounded-3xl blur-2xl scale-105" />

          {/* Main Glass Panel */}
          <div className="relative bg-white/90 dark:bg-[#111827]/90 backdrop-blur-2xl rounded-2xl shadow-2xl shadow-black/8 dark:shadow-black/40 border border-slate-200/70 dark:border-white/8 overflow-hidden">
            {/* Window Controls */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-white/5 bg-slate-50/60 dark:bg-black/20">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400/70" />
                <div className="w-3 h-3 rounded-full bg-amber-400/70" />
                <div className="w-3 h-3 rounded-full bg-green-400/70" />
              </div>
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 rounded-lg px-3 py-1.5">
                <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-white/20 flex items-center justify-center">
                  <Shield className="w-2 h-2 text-green-500" />
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  himsog.app/map
                </span>
              </div>
              <div className="w-16" />
            </div>

            {/* App Interface */}
            <div className="flex h-[420px] sm:h-[480px] md:h-[520px]">
              {/* Sidebar */}
              <div className="hidden md:flex w-56 border-r border-slate-100 dark:border-white/5 flex-col bg-white/50 dark:bg-[#111827]/50">
                <div className="p-4 space-y-1.5">
                  {[
                    {
                      icon: Activity,
                      label: "Overview",
                      active: false,
                    },
                    {
                      icon: MapPin,
                      label: "Map View",
                      active: true,
                    },
                    {
                      icon: CalendarCheck,
                      label: "Appointments",
                      active: false,
                    },
                    {
                      icon: Star,
                      label: "Favorites",
                      active: false,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        item.active
                          ? "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </div>
                  ))}
                </div>

                {/* Sidebar stat card */}
                <div className="mt-auto p-4">
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/40 dark:to-cyan-950/30 rounded-xl p-3.5 border border-teal-100/50 dark:border-teal-800/30">
                    <div className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">
                      Nearby Providers
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      47
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      within 5km radius
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Map Area */}
              <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#0f141f] dark:to-[#0a0e17]">
                {/* Map grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-size-[48px_48px]" />

                {/* Animated Map Markers */}
                {[
                  {
                    x: "25%",
                    y: "35%",
                    color: "bg-teal-500",
                    ring: "ring-teal-500/20",
                    label: "City Hospital",
                    icon: <Activity className="w-4 h-4 text-white" />,
                  },
                  {
                    x: "55%",
                    y: "22%",
                    color: "bg-violet-500",
                    ring: "ring-violet-500/20",
                    label: "Dental Care",
                    icon: <Star className="w-4 h-4 text-white" />,
                  },
                  {
                    x: "70%",
                    y: "55%",
                    color: "bg-amber-500",
                    ring: "ring-amber-500/20",
                    label: "Derma Clinic",
                    icon: <Clock className="w-4 h-4 text-white" />,
                  },
                  {
                    x: "40%",
                    y: "65%",
                    color: "bg-rose-500",
                    ring: "ring-rose-500/20",
                    label: "Pharmacy Plus",
                    icon: <Shield className="w-4 h-4 text-white" />,
                  },
                ].map((marker, i) => (
                  <div
                    key={i}
                    className="absolute"
                    style={{ top: marker.y, left: marker.x }}
                  >
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        duration: 3.5,
                        delay: i * 0.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="relative group cursor-pointer"
                    >
                      <div
                        className={`w-9 h-9 ${marker.color} rounded-xl ring-4 ${marker.ring} flex items-center justify-center shadow-lg relative z-10`}
                      >
                        {marker.icon}
                      </div>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-black/8 dark:bg-black/20 blur-sm rounded-full" />

                      {/* Tooltip */}
                      <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-xl pointer-events-none">
                        {marker.label}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-white" />
                      </div>
                    </motion.div>
                  </div>
                ))}

                {/* Search Bar */}
                <div className="absolute top-4 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-[90%] sm:max-w-md bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-lg shadow-black/5 dark:shadow-black/30 border border-slate-200/60 dark:border-white/5 flex items-center gap-3">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-sm text-slate-400 dark:text-slate-500">
                    Search clinics, hospitals...
                  </span>
                </div>

                {/* Floating Provider Card */}
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="absolute bottom-4 right-4 bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-slate-100 dark:border-white/5 w-56 hidden sm:block"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shrink-0">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        City Hospital
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < 4 ? "text-amber-400 fill-amber-400" : "text-slate-200 dark:text-slate-600"}`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-500 ml-1">
                          4.8
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      Open now
                    </span>
                    <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-full">
                      Book Now
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

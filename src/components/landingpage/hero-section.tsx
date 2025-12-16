"use client";

import React from 'react';
import Link from 'next/link';
import { Search, MapPin, ArrowRight, Activity, Clock, Zap, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-screen flex flex-col justify-center">
      <div className="max-w-7xl mx-auto text-center relative z-10 w-full">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full px-3 py-1 mb-8 backdrop-blur-md shadow-sm"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Now live in Digos City</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-slate-900 dark:text-white tracking-tight mb-8 leading-[1.1] md:leading-[1.1]"
        >
          Find Nearby <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-linear-to-br from-cyan-500 via-blue-500 to-purple-600">
            Healthcare Services
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          The all-in-one platform connecting Digos City patients with providers.
          Real-time mapping, AI assistance, and booking features.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24"
        >
          <Link href="/browse-services" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold px-8 py-4 rounded-full transition-all shadow-xl shadow-cyan-500/20 hover:scale-105 active:scale-95 cursor-pointer">
            <Search className="w-5 h-5" />
            Browse Services
          </Link>
          <Link href="/map" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-slate-700 dark:text-white border border-slate-200 dark:border-white/10 font-bold px-8 py-4 rounded-full transition-all backdrop-blur-sm hover:scale-105 active:scale-95 cursor-pointer">
            <MapPin className="w-5 h-5" />
            Explore Map
          </Link>
        </motion.div>

        {/* 3D Perspective Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, rotateX: 20, y: 100 }}
          animate={{ opacity: 1, rotateX: 0, y: 0 }}
          transition={{ duration: 1, delay: 0.4, type: "spring", stiffness: 50 }}
          className="relative mx-auto max-w-6xl perspective-1000"
        >
          {/* Main Glass Panel */}
          <div className="relative bg-white/80 dark:bg-[#111827]/80 backdrop-blur-2xl rounded-2xl shadow-2xl shadow-black/20 dark:shadow-cyan-900/10 border border-slate-200/60 dark:border-white/10 overflow-hidden ring-1 ring-slate-900/5">

            {/* Window Controls */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
              </div>
              <div className="h-2 w-40 bg-slate-200 dark:bg-white/5 rounded-full"></div>
              <div className="w-4"></div>
            </div>

            {/* App Interface */}
            <div className="flex h-[500px] md:h-[600px] bg-slate-50 dark:bg-[#0B0F19]">

              {/* Sidebar */}
              <div className="hidden md:flex w-64 border-r border-slate-200 dark:border-white/5 flex-col p-4 bg-white dark:bg-[#111827]">
                <div className="space-y-2">
                  <div className="h-10 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 rounded-lg flex items-center px-3 font-medium text-sm gap-3">
                    <Activity className="w-4 h-4" /> Overview
                  </div>
                  <div className="h-10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg flex items-center px-3 font-medium text-sm gap-3 transition-colors">
                    <Clock className="w-4 h-4" /> Appointments
                  </div>
                  <div className="h-10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg flex items-center px-3 font-medium text-sm gap-3 transition-colors">
                    <MapPin className="w-4 h-4" /> Map View
                  </div>
                </div>

              </div>

              {/* Main Map/Content Area */}
              <div className="flex-1 relative overflow-hidden bg-slate-100 dark:bg-[#0f141f]">
                {/* Abstract Map Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[40px_40px]"></div>

                {/* Map Markers (Animated) */}
                {[
                  { x: '30%', y: '40%', color: 'text-cyan-500', icon: <Activity className="w-5 h-5" />, label: "City Hospital" },
                  { x: '60%', y: '25%', color: 'text-purple-500', icon: <MapPin className="w-5 h-5" />, label: "Dental Care" },
                  { x: '50%', y: '70%', color: 'text-pink-500', icon: <Star className="w-5 h-5 fill-current" />, label: "Derma Clinic" }
                ].map((marker, i) => (
                  <div key={i} className="absolute" style={{ top: marker.y, left: marker.x }}>
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 3, delay: i, repeat: Infinity, ease: "easeInOut" }}
                      className="relative group cursor-pointer"
                    >
                      <div className={`w-12 h-12 bg-white dark:bg-[#1E293B] rounded-2xl shadow-lg border border-slate-100 dark:border-white/5 flex items-center justify-center ${marker.color} z-10 relative`}>
                        {marker.icon}
                      </div>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-black/10 dark:bg-black/30 blur-sm rounded-full"></div>

                      {/* Tooltip */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
                        {marker.label}
                      </div>
                    </motion.div>
                  </div>
                ))}

                {/* Search Bar Floating */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-white/90 dark:bg-[#1E293B]/90 backdrop-blur-md p-2 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-200 dark:border-white/5 flex items-center gap-3">
                  <Search className="w-5 h-5 text-slate-400 ml-2" />
                  <div className="h-2 w-32 bg-slate-200 dark:bg-white/10 rounded-full"></div>
                </div>

                {/* Floating Card */}
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="absolute bottom-8 right-8 bg-white/90 dark:bg-[#1E293B]/90 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-slate-100 dark:border-white/5 w-72"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Assistant</div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-cyan-500 p-2.5 rounded-lg rounded-br-none text-xs text-white ml-auto w-fit">
                      Find Healthcare Provider.
                    </div>
                    <div className="bg-slate-100 dark:bg-black/20 p-2.5 rounded-lg rounded-tl-none text-xs text-slate-600 dark:text-slate-300">
                      Found 3 clinics open now near you.
                    </div>
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
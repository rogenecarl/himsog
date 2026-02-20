"use client";

import {
  Map,
  Calendar,
  ShieldCheck,
  MessageCircle,
  Bot,
  Sparkles,
  MapPin,
  Send,
  Clock,
  Star,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true } as const,
};

const Features: React.FC = () => {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden transition-colors duration-300">
      {/* Section background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 to-slate-50 dark:via-[#0A0D14]/50 dark:to-[#0A0D14]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
          <motion.div
            {...fadeUp}
            className="inline-flex items-center gap-2 bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/40 rounded-full px-4 py-1.5 mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="text-xs font-semibold text-teal-700 dark:text-teal-300 tracking-wide">
              Platform Features
            </span>
          </motion.div>
          <motion.h2
            {...fadeUp}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-5 tracking-tight leading-[1.15]"
          >
            Everything you need,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400">
              in one platform.
            </span>
          </motion.h2>
          <motion.p
            {...fadeUp}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-slate-500 dark:text-slate-400 leading-relaxed"
          >
            Discover verified providers, book appointments, and communicate
            directly — all powered by real-time geolocation.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 sm:gap-5">
          {/* Card 1: Smart Map — large card */}
          <motion.div
            {...fadeUp}
            className="md:col-span-4 bg-white dark:bg-[#111827] rounded-2xl p-6 sm:p-8 border border-slate-200/70 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow overflow-hidden relative group min-h-[320px] flex flex-col"
          >
            <div className="relative z-10 flex-1">
              <div className="w-11 h-11 bg-teal-50 dark:bg-teal-900/20 rounded-xl flex items-center justify-center mb-5 text-teal-600 dark:text-teal-400 group-hover:scale-105 transition-transform duration-300">
                <Map className="w-5 h-5" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Smart Geolocation Map
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
                Find open clinics in real-time. Filter by hospitals, dental,
                veterinary, or derma services with live navigation data across
                Digos City.
              </p>
            </div>

            {/* Mini floating cards decoration */}
            <div className="absolute right-4 bottom-4 sm:right-8 sm:bottom-8 flex gap-3">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="bg-white dark:bg-[#1E293B] p-3 rounded-xl shadow-md border border-slate-100 dark:border-white/5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-900 dark:text-white">
                      Verified
                    </div>
                    <div className="text-[9px] text-slate-400">
                      Trusted providers
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Background decoration */}
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-teal-50/50 dark:from-teal-950/10 to-transparent pointer-events-none" />
          </motion.div>

          {/* Card 2: Instant Booking */}
          <motion.div
            {...fadeUp}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 bg-white dark:bg-[#111827] rounded-2xl p-6 sm:p-8 border border-slate-200/70 dark:border-white/5 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-11 h-11 bg-violet-50 dark:bg-violet-900/20 rounded-xl flex items-center justify-center mb-5 text-violet-600 dark:text-violet-400 group-hover:scale-105 transition-transform duration-300">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
              Instant Booking
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
              Schedule appointments with one click. No phone calls, no waiting.
            </p>

            {/* Mini calendar mockup */}
            <div className="grid grid-cols-7 gap-1">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <div
                  key={i}
                  className="text-[9px] text-slate-400 text-center font-medium"
                >
                  {d}
                </div>
              ))}
              {Array.from({ length: 14 }, (_, i) => (
                <div
                  key={i}
                  className={`text-[10px] text-center py-1 rounded-md font-medium ${
                    i === 8
                      ? "bg-teal-500 text-white"
                      : i === 5 || i === 12
                        ? "bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400"
                        : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card 3: Real-time Messaging */}
          <motion.div
            {...fadeUp}
            transition={{ delay: 0.15 }}
            className="md:col-span-2 bg-gradient-to-br from-teal-600 to-cyan-700 dark:from-teal-700 dark:to-cyan-800 rounded-2xl p-6 sm:p-8 shadow-lg text-white relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/15 transition-all" />
            <MessageCircle className="w-9 h-9 text-white/90 mb-5 relative z-10" />
            <h3 className="text-lg sm:text-xl font-bold mb-2 relative z-10">
              Real-time Messaging
            </h3>
            <p className="text-sm text-white/70 relative z-10 leading-relaxed mb-5">
              Message providers directly through secure, real-time
              conversations.
            </p>

            {/* Chat bubbles decoration */}
            <div className="relative z-10 space-y-2">
              <div className="bg-white/15 backdrop-blur-sm px-3 py-2 rounded-lg rounded-bl-none text-xs text-white/90 w-fit">
                Is Dr. Santos available today?
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg rounded-br-none text-xs text-white/90 w-fit ml-auto">
                Yes! 3:00 PM slot is open.
              </div>
            </div>
          </motion.div>

          {/* Card 4: Provider Verification */}
          <motion.div
            {...fadeUp}
            transition={{ delay: 0.2 }}
            className="md:col-span-2 bg-white dark:bg-[#111827] rounded-2xl p-6 sm:p-8 border border-slate-200/70 dark:border-white/5 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-11 h-11 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center mb-5 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform duration-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
              Verified Providers
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Every clinic and specialist is verified by our admin team.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {["bg-teal-400", "bg-violet-400", "bg-amber-400"].map(
                  (color, i) => (
                    <div
                      key={i}
                      className={`w-7 h-7 rounded-full ${color} border-2 border-white dark:border-[#111827] flex items-center justify-center`}
                    >
                      <Star className="w-3 h-3 text-white" />
                    </div>
                  )
                )}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                100+ verified
              </span>
            </div>
          </motion.div>

          {/* Card 5: Ratings */}
          <motion.div
            {...fadeUp}
            transition={{ delay: 0.25 }}
            className="md:col-span-2 bg-white dark:bg-[#111827] rounded-2xl p-6 sm:p-8 border border-slate-200/70 dark:border-white/5 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-11 h-11 bg-rose-50 dark:bg-rose-900/20 rounded-xl flex items-center justify-center mb-5 text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform duration-300">
              <Star className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
              Ratings & Reviews
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Read honest reviews from real patients to find the best care.
            </p>
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < 4 ? "text-amber-400 fill-amber-400" : "text-slate-200 dark:text-slate-700"}`}
                />
              ))}
              <span className="text-sm font-bold text-slate-900 dark:text-white ml-1.5">
                4.8
              </span>
              <span className="text-xs text-slate-400">avg</span>
            </div>
          </motion.div>

          {/* Card 6: AI Assistant — full width */}
          <motion.div
            {...fadeUp}
            transition={{ delay: 0.3 }}
            className="md:col-span-6 bg-white dark:bg-[#111827] rounded-2xl p-6 sm:p-8 border border-slate-200/70 dark:border-white/5 shadow-sm overflow-hidden relative"
          >
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/3 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row gap-8">
              {/* Info Side */}
              <div className="flex-1 flex flex-col justify-center relative z-10">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-500/20 rounded-xl flex items-center justify-center mb-5 text-indigo-600 dark:text-indigo-400">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Himsog AI Assistant
                  </h3>
                  <span className="bg-gradient-to-r from-indigo-500 to-violet-500 text-[10px] font-bold px-2.5 py-0.5 rounded-full text-white shadow-sm">
                    BETA
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 max-w-md">
                  Your personal healthcare guide. Ask about booking, find
                  providers, navigate the platform, or learn about services.
                  Available 24/7.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    "Find Providers",
                    "Booking Help",
                    "Navigation",
                    "Service Info",
                  ].map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"
                    >
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0" />
                      {tag}
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Mockup */}
              <div className="flex-1 bg-slate-50 dark:bg-[#0f141f] border border-slate-200/70 dark:border-white/5 rounded-xl p-1 flex flex-col relative z-10 h-[340px] sm:h-[360px]">
                <div className="bg-white dark:bg-[#1E293B] rounded-lg h-full flex flex-col overflow-hidden">
                  {/* Chat Header */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-white/5">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                        AI Assistant
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] text-slate-400">
                          Online
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto space-y-3 p-4 scrollbar-hide bg-slate-50/50 dark:bg-black/20">
                    <div className="flex flex-col items-end">
                      <div className="max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed bg-indigo-600 text-white rounded-br-none">
                        How do I book an appointment?
                      </div>
                    </div>
                    <div className="flex flex-col items-start">
                      <div className="max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-none border border-slate-100 dark:border-slate-600">
                        Browse services or use the map to find a provider. Pick
                        a service, choose your date, and confirm!
                      </div>
                      <div className="mt-2 w-full max-w-[80%]">
                        <div className="bg-white dark:bg-slate-800 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2.5 hover:border-indigo-400 transition-colors cursor-pointer group/link">
                          <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-slate-900 dark:text-white">
                              Browse Services
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Find providers near you
                            </div>
                          </div>
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover/link:text-indigo-500 transition-colors shrink-0" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input */}
                  <div className="px-3 py-2.5 bg-white dark:bg-[#1E293B] border-t border-slate-100 dark:border-white/5">
                    <div className="relative">
                      <div className="w-full bg-slate-50 dark:bg-[#0f141f] border border-slate-200 dark:border-slate-700 text-slate-400 text-sm rounded-lg pl-3.5 pr-10 py-2.5 select-none">
                        Ask about booking, providers...
                      </div>
                      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-indigo-600/40 rounded-md flex items-center justify-center cursor-not-allowed">
                        <Send className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Features;

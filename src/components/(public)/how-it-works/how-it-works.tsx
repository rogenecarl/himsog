import { Search, Check, User, MapPin } from "lucide-react";

export default function HowItWorks() {
  return (
    <section className="bg-white dark:bg-[#0B0F19] relative overflow-hidden transition-colors duration-300">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-[#0B0F19] bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-size[24px_24px]"></div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center rounded-full border border-cyan-100 dark:border-cyan-900/50 bg-cyan-50/50 dark:bg-cyan-900/20 px-3 py-1 text-xs font-medium text-cyan-800 dark:text-cyan-400 mb-4">
            <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-500 mr-2"></span>
            Simple Process
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
            Your Appointment in 3 Steps
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
            We&apos;ve removed the friction from healthcare. No more phone
            tag—just find, book, and go.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative max-w-6xl mx-auto">
          {/* Connecting Dashed Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 border-t-2 border-dashed border-slate-200 dark:border-slate-700 -z-10"></div>

          {/* STEP 1: Find Services */}
          <div className="group relative">
            <div className="bg-slate-50 dark:bg-[#1E293B] rounded-2xl border border-slate-100 dark:border-white/10 p-1 shadow-sm hover:shadow-md transition-shadow duration-300 h-64 mb-6 overflow-hidden relative">
              {/* UI Mockup: Search Interface */}
              <div className="absolute inset-x-4 top-8 bottom-0 bg-white dark:bg-slate-800 rounded-t-xl border border-slate-200 dark:border-white/10 shadow-sm p-4">
                {/* Mock Search Bar */}
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 mb-4">
                  <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <div className="h-2 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
                {/* Mock Results */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors cursor-default">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <MapPin size={14} />
                    </div>
                    <div>
                      <div className="h-2 w-20 bg-slate-800 dark:bg-slate-300 rounded mb-1"></div>
                      <div className="h-1.5 w-12 bg-slate-300 dark:bg-slate-600 rounded"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors cursor-default">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                      <User size={14} />
                    </div>
                    <div>
                      <div className="h-2 w-24 bg-slate-800 dark:bg-slate-300 rounded mb-1"></div>
                      <div className="h-1.5 w-16 bg-slate-300 dark:bg-slate-600 rounded"></div>
                    </div>
                  </div>
                </div>
                {/* Cursor (Visual cue) */}
                <div className="absolute bottom-8 right-8 w-4 h-4 bg-slate-900/20 dark:bg-white/20 rounded-full blur-sm pointer-events-none group-hover:animate-ping"></div>
              </div>

              {/* Step Number Badge */}
              <div className="absolute top-4 left-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold w-8 h-8 rounded-lg flex items-center justify-center shadow-sm z-20">
                1
              </div>
            </div>
            <div className="px-2">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Browse & Select
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Search for hospitals, dentists, or vets. Filter by location or
                specialty to find exactly what you need.
              </p>
            </div>
          </div>

          {/* STEP 2: Pick Time */}
          <div className="group relative">
            <div className="bg-slate-50 dark:bg-[#1E293B] rounded-2xl border border-slate-100 dark:border-white/10 p-1 shadow-sm hover:shadow-md transition-shadow duration-300 h-64 mb-6 overflow-hidden relative">
              {/* UI Mockup: Calendar Interface */}
              <div className="absolute inset-x-8 top-8 bottom-0 bg-white dark:bg-slate-800 rounded-t-xl border border-slate-200 dark:border-white/10 shadow-sm p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="h-3 w-16 bg-slate-800 dark:bg-slate-300 rounded"></div>
                  <div className="flex gap-1">
                    <div className="w-4 h-4 rounded bg-slate-100 dark:bg-slate-700"></div>
                    <div className="w-4 h-4 rounded bg-slate-100 dark:bg-slate-700"></div>
                  </div>
                </div>
                {/* Time Slots Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="border border-slate-200 dark:border-white/10 rounded px-2 py-2 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900">
                    09:00 AM
                  </div>
                  <div className="border border-slate-200 dark:border-white/10 rounded px-2 py-2 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900">
                    10:00 AM
                  </div>
                  <div className="border border-cyan-500 bg-cyan-50 dark:bg-cyan-900/30 rounded px-2 py-2 flex items-center justify-center text-xs text-cyan-700 dark:text-cyan-400 font-medium shadow-sm scale-105 transition-transform">
                    <Check size={10} className="mr-1" /> 11:30 AM
                  </div>
                  <div className="border border-slate-200 dark:border-white/10 rounded px-2 py-2 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 opacity-50 dashed">
                    Booked
                  </div>
                </div>
              </div>

              <div className="absolute top-4 left-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold w-8 h-8 rounded-lg flex items-center justify-center shadow-sm z-20">
                2
              </div>
            </div>
            <div className="px-2">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Choose a Slot
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                View real-time availability. Pick a date and time that works for
                you without calling the front desk.
              </p>
            </div>
          </div>

          {/* STEP 3: Confirmation */}
          <div className="group relative">
            <div className="bg-slate-50 dark:bg-[#1E293B] rounded-2xl border border-slate-100 dark:border-white/10 p-1 shadow-sm hover:shadow-md transition-shadow duration-300 h-64 mb-6 overflow-hidden relative flex items-center justify-center">
              {/* UI Mockup: Notification Card */}
              <div className="relative w-48 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 shadow-lg p-4 transform group-hover:scale-105 transition-transform duration-300">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                    <Check size={16} strokeWidth={3} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800 dark:text-white">
                      Confirmed!
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Your appointment is set for Oct 24.
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-50 dark:border-white/10 flex justify-between items-center">
                  <div className="flex -space-x-2">
                    <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 border border-white dark:border-slate-800"></div>
                    <div className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-600 border border-white dark:border-slate-800"></div>
                  </div>
                  <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-medium">
                    Add to Calendar
                  </div>
                </div>
              </div>

              {/* Floating Bell */}
              <div className="absolute top-8 right-10 bg-red-500 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 z-10 animate-bounce"></div>

              <div className="absolute top-4 left-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold w-8 h-8 rounded-lg flex items-center justify-center shadow-sm z-20">
                3
              </div>
            </div>
            <div className="px-2">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Get Approved
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Receive instant confirmation. We&apos;ll send you reminders and
                sync the details directly to your calendar.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Indicator */}
        <div className="mt-20 border-t border-slate-100 dark:border-white/10 pt-10 text-center">
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-widest">
            Trusted by top providers in Digos City
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Placeholder Logos */}
            <div className="font-bold text-xl text-slate-800 dark:text-slate-300 flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 rounded-md"></div>DigosMed
            </div>
            <div className="font-bold text-xl text-slate-800 dark:text-slate-300 flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded-full"></div>CityVet
            </div>
            <div className="font-bold text-xl text-slate-800 dark:text-slate-300 flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-500 rounded-tr-xl"></div>
              DentalPlus
            </div>
            <div className="font-bold text-xl text-slate-800 dark:text-slate-300 flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-500 rounded-lg rotate-45"></div>
              DermaCare
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

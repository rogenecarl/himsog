"use client";

import { motion } from "framer-motion";
import { Search, CalendarCheck, MessageCircle, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Discover Providers",
    description:
      "Browse our interactive map or search by specialty to find verified healthcare providers near you in Digos City.",
    color: "from-teal-500 to-cyan-600",
    iconBg: "bg-teal-50 dark:bg-teal-900/20",
    iconColor: "text-teal-600 dark:text-teal-400",
  },
  {
    number: "02",
    icon: CalendarCheck,
    title: "Book Instantly",
    description:
      "Choose your preferred date and time. No phone calls needed — confirm your appointment with a single click.",
    color: "from-violet-500 to-indigo-600",
    iconBg: "bg-violet-50 dark:bg-violet-900/20",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  {
    number: "03",
    icon: MessageCircle,
    title: "Get Care",
    description:
      "Message your provider directly, receive reminders, and manage your healthcare journey all in one place.",
    color: "from-amber-500 to-orange-600",
    iconBg: "bg-amber-50 dark:bg-amber-900/20",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/40 rounded-full px-4 py-1.5 mb-6"
          >
            <span className="text-xs font-semibold text-teal-700 dark:text-teal-300 tracking-wide">
              How It Works
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-5 tracking-tight leading-[1.15]"
          >
            Three steps to
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400">
              better healthcare.
            </span>
          </motion.h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
          {/* Connector lines (desktop only) */}
          <div className="hidden md:block absolute top-20 left-[33%] right-[33%] h-px">
            <div className="w-full h-full bg-gradient-to-r from-slate-200 via-slate-200 to-slate-200 dark:from-white/10 dark:via-white/10 dark:to-white/10" />
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative"
            >
              <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 sm:p-8 border border-slate-200/70 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow group">
                {/* Step number */}
                <div className="flex items-center justify-between mb-6">
                  <span
                    className={`text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br ${step.color} opacity-30`}
                  >
                    {step.number}
                  </span>
                  <div
                    className={`w-11 h-11 ${step.iconBg} rounded-xl flex items-center justify-center ${step.iconColor} group-hover:scale-105 transition-transform duration-300`}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {step.description}
                </p>

                {/* Arrow for non-last items (mobile) */}
                {i < steps.length - 1 && (
                  <div className="md:hidden flex justify-center mt-6">
                    <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600 rotate-90" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

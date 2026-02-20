"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800 dark:from-teal-800 dark:via-teal-900 dark:to-cyan-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.08),transparent_60%)]" />

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-400/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

          {/* Content */}
          <div className="relative z-10 px-6 sm:px-12 py-14 sm:py-20 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-8"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-200" />
              <span className="text-xs font-semibold text-teal-100 tracking-wide">
                Free to get started
              </span>
            </motion.div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 tracking-tight leading-[1.15]">
              Ready to take control of
              <br />
              your healthcare journey?
            </h2>
            <p className="text-base sm:text-lg text-teal-100/80 max-w-xl mx-auto mb-10 leading-relaxed">
              Join thousands of users in Digos City who are already finding
              better care, faster. No credit card required.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/auth/choose-role"
                className="w-full sm:w-auto group flex items-center justify-center gap-2.5 bg-white hover:bg-slate-50 text-teal-700 font-semibold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/browse-services"
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold px-7 py-3.5 rounded-xl transition-all backdrop-blur-sm hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                Browse Services
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

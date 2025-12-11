"use client";


import { FileQuestion, Home, Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0F19] p-4 transition-colors duration-300">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/20 border border-slate-200 dark:border-white/10 p-8 text-center">
          {/* Icon Section */}
          <div className="flex justify-center mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-full relative">
              <FileQuestion className="w-12 h-12 text-blue-600 dark:text-blue-400 relative z-10" />
              {/* Decorative faint background ring */}
              <div className="absolute inset-0 bg-blue-100 dark:bg-blue-400/20 rounded-full animate-ping opacity-20"></div>
            </div>
          </div>

          {/* Text Content */}
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            404
          </h1>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">
            Page Not Found
          </h2>

          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Sorry, the page you are looking for doesn&apos;t exist or has been moved.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Primary Action */}
            <Link
              href="/"
              className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg group"
            >
              <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Go to Homepage
            </Link>

            {/* Secondary Action */}
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-slate-300 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
          </div>

          {/* Footer Help Text */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/10">
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
              <Search className="w-4 h-4" />
              <span>Looking for something else? <a href="/search" className="text-blue-600 dark:text-blue-400 hover:underline">Search our site</a></span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
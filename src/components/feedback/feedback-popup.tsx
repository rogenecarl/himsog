"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, MessageSquareHeart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/UserContext";

const FEEDBACK_STORAGE_KEY = "himsog_feedback_tracker";
const MAX_POPUPS_PER_DAY = 3;
const MIN_DELAY_MS = 30000; // 30 seconds minimum before first popup
const MAX_DELAY_MS = 180000; // 3 minutes maximum delay

interface FeedbackTracker {
  date: string;
  count: number;
  dismissed: boolean;
  lastShown: number;
}

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function getTracker(): FeedbackTracker {
  if (typeof window === "undefined") {
    return { date: getTodayDate(), count: 0, dismissed: false, lastShown: 0 };
  }

  try {
    const stored = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (stored) {
      const tracker = JSON.parse(stored) as FeedbackTracker;
      // Reset if it's a new day
      if (tracker.date !== getTodayDate()) {
        return { date: getTodayDate(), count: 0, dismissed: false, lastShown: 0 };
      }
      return tracker;
    }
  } catch {
    // Ignore parse errors
  }

  return { date: getTodayDate(), count: 0, dismissed: false, lastShown: 0 };
}

function saveTracker(tracker: FeedbackTracker): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(tracker));
}

function shouldShowPopup(): boolean {
  const tracker = getTracker();

  // Don't show if dismissed today or max popups reached
  if (tracker.dismissed || tracker.count >= MAX_POPUPS_PER_DAY) {
    return false;
  }

  return true;
}

function getRandomDelay(): number {
  return Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS)) + MIN_DELAY_MS;
}

export function FeedbackPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();
  const user = useUser();

  useEffect(() => {
    // Only show for authenticated users
    if (!user) return;

    // Check if we should show popup
    if (!shouldShowPopup()) return;

    // Set random delay before showing
    const delay = getRandomDelay();

    const timer = setTimeout(() => {
      const tracker = getTracker();

      // Double-check conditions before showing
      if (tracker.dismissed || tracker.count >= MAX_POPUPS_PER_DAY) {
        return;
      }

      // Update tracker
      tracker.count += 1;
      tracker.lastShown = Date.now();
      saveTracker(tracker);

      // Show popup with animation
      setIsAnimating(true);
      setTimeout(() => setIsVisible(true), 50);
    }, delay);

    return () => clearTimeout(timer);
  }, [user]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleDismissForToday = () => {
    const tracker = getTracker();
    tracker.dismissed = true;
    saveTracker(tracker);
    handleDismiss();
  };

  const handleTakeSurvey = () => {
    handleDismiss();
    router.push("/feedback");
  };

  if (!isAnimating) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50",
        "transform transition-all duration-300 ease-out",
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0"
      )}
    >
      <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-4 relative">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-white" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <MessageSquareHeart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Help Us Improve!</h3>
              <p className="text-white/80 text-sm">Your feedback matters</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
            We&apos;d love to hear your thoughts! Take a quick survey to help us make Himsog better for everyone.
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleTakeSurvey}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
            >
              Take Survey
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button
              variant="ghost"
              onClick={handleDismissForToday}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 text-sm"
            >
              Don&apos;t show today
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

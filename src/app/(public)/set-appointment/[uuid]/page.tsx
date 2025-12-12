"use client";

import { useProviderById } from "@/hooks/use-create-provider-profile";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import AppointmentStep1 from "@/components/(public)/set-appointment-components/appointment-step-1";
import AppointmentStep2 from "@/components/(public)/set-appointment-components/appointment-step-2";
import AppointmentStep3 from "@/components/(public)/set-appointment-components/appointment-step-3";
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCreateUserAppointmentStore } from "@/store/create-user-appointment-store";
import { SetAppointmentSkeleton } from "@/components/(public)/set-appointment-components/set-appointment-skeleton";

export default function ProviderSetAppointmentPage() {
  const params = useParams();
  const uuid = params?.uuid as string;

  // OPTIMIZED: Fetch only the single provider needed instead of ALL providers
  const { data: provider, isLoading, error } = useProviderById(uuid);

  const router = useRouter()

  // Zustand store
  const {
    providerId,
    setData,
    clearData,
    isStep1Complete,
    isStep2Complete,
  } = useCreateUserAppointmentStore();

  const [step, setStep] = useState(1)

  // Refs for cleanup effect to access latest values
  const stepRef = useRef(step);
  const clearDataRef = useRef(clearData);

  // Keep refs updated
  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    clearDataRef.current = clearData;
  }, [clearData]);

  // Initialize provider ID in store when component mounts
  useEffect(() => {
    if (uuid && uuid !== providerId) {
      setData({ providerId: uuid });
    }
  }, [uuid, providerId, setData]);

  // Clear store data when leaving the page
  useEffect(() => {
    return () => {
      // Only clear if user navigates away without completing
      if (stepRef.current < 3) {
        clearDataRef.current();
      }
    };
  }, []);

  if (isLoading) {
    return <SetAppointmentSkeleton />;
  }

  if (error) {
    return <p>Failed to load provider details.</p>;
  }

  if (!provider) {
    return <p>Provider not found.</p>;
  }

  const progress = (step / 3) * 100

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] py-4 sm:py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 p-2.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
              Book Appointment
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">
              {provider.healthcareName}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6 sm:mb-8 rounded-lg p-4 sm:p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10">
          <div className="mb-3 flex justify-between items-center">
            <span className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
              Step {step} of 3
            </span>
            <span className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-400">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2 sm:h-3" />

          {/* Step indicators */}
          <div className="mt-4 flex justify-between text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <span className={step >= 1 ? "text-cyan-600 dark:text-cyan-400 font-medium" : ""}>
              Select Services
            </span>
            <span className={step >= 2 ? "text-cyan-600 dark:text-cyan-400 font-medium" : ""}>
              Choose Date & Time
            </span>
            <span className={step >= 3 ? "text-cyan-600 dark:text-cyan-400 font-medium" : ""}>
              Review & Confirm
            </span>
          </div>
        </div>

        {/* Steps */}
        <div className="mb-6 sm:mb-8">
          {step === 1 && (
            <AppointmentStep1
              provider={provider}
            />
          )}

          {step === 2 && (
            <AppointmentStep2
              providerId={provider.id}
            />
          )}

          {step === 3 && (
            <AppointmentStep3
              provider={provider}
              onPrevious={() => setStep(2)}
            />
          )}
        </div>

        {/* Navigation Buttons - Only show for steps 1 and 2 */}
        {step < 3 && (
          <div className="sticky bottom-4 sm:bottom-6 bg-white dark:bg-[#1E293B] rounded-lg p-4 sm:p-6 shadow-lg border border-slate-200 dark:border-white/10">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                variant="outline"
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
                className="flex-1 h-11 sm:h-12 font-semibold border-slate-300 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                Previous
              </Button>
              <Button
                onClick={() => {
                  if (step === 1 && !isStep1Complete()) {
                    alert("Please select at least one service")
                    return
                  }
                  if (step === 2 && !isStep2Complete()) {
                    alert("Please select date and time")
                    return
                  }
                  setStep(Math.min(3, step + 1))
                }}
                disabled={
                  (step === 1 && !isStep1Complete()) ||
                  (step === 2 && !isStep2Complete())
                }
                className="flex-1 h-11 sm:h-12 bg-cyan-700 hover:bg-cyan-800 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Step
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

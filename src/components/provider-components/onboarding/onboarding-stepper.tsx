"use client";

import { cn } from "@/lib/utils";
import { Building2, Clock, FileText, MapPin, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface Step {
  id: number;
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const steps: Step[] = [
  {
    id: 1,
    name: "Business Info",
    description: "Basic details",
    href: "/provider/onboarding/step-1",
    icon: Building2,
  },
  {
    id: 2,
    name: "Services",
    description: "Services & hours",
    href: "/provider/onboarding/step-2",
    icon: Clock,
  },
  {
    id: 3,
    name: "Documents",
    description: "Verification",
    href: "/provider/onboarding/step-3",
    icon: FileText,
  },
  {
    id: 4,
    name: "Location",
    description: "Map location",
    href: "/provider/onboarding/step-4",
    icon: MapPin,
  },
  {
    id: 5,
    name: "Complete",
    description: "Final review",
    href: "/provider/onboarding/summary",
    icon: CheckCircle2,
  },
];

interface OnboardingStepperProps {
  currentStep: number;
}

export function OnboardingStepper({ currentStep }: OnboardingStepperProps) {
  return (
    <div className="w-full mb-8">
      {/* Mobile stepper - simplified */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {steps[currentStep - 1]?.name}
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                step.id < currentStep
                  ? "bg-green-500"
                  : step.id === currentStep
                  ? "bg-blue-500"
                  : "bg-slate-300 dark:bg-slate-600"
              )}
            />
          ))}
        </div>
      </div>

      {/* Desktop stepper */}
      <nav aria-label="Progress" className="hidden sm:block">
        <ol className="flex items-center">
          {steps.map((step, stepIdx) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isClickable = step.id < currentStep;

            return (
              <li
                key={step.name}
                className={cn(
                  "relative",
                  stepIdx !== steps.length - 1 ? "flex-1 pr-8" : ""
                )}
              >
                {/* Connector line */}
                {stepIdx !== steps.length - 1 && (
                  <div
                    className="absolute top-5 left-10 -right-2 h-0.5"
                    aria-hidden="true"
                  >
                    <div
                      className={cn(
                        "h-full transition-all duration-500",
                        isCompleted
                          ? "bg-gradient-to-r from-green-500 to-green-400"
                          : "bg-slate-200 dark:bg-slate-700"
                      )}
                    />
                  </div>
                )}

                {/* Step content */}
                <div className="relative flex flex-col items-start group">
                  {isClickable ? (
                    <Link href={step.href} className="flex flex-col items-start">
                      <StepContent
                        step={step}
                        isCompleted={isCompleted}
                        isCurrent={isCurrent}
                        isClickable={isClickable}
                      />
                    </Link>
                  ) : (
                    <div className="flex flex-col items-start">
                      <StepContent
                        step={step}
                        isCompleted={isCompleted}
                        isCurrent={isCurrent}
                        isClickable={isClickable}
                      />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

function StepContent({
  step,
  isCompleted,
  isCurrent,
  isClickable,
}: {
  step: Step;
  isCompleted: boolean;
  isCurrent: boolean;
  isClickable: boolean;
}) {
  const Icon = step.icon;

  return (
    <>
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
          isCompleted
            ? "border-green-500 bg-green-500 text-white"
            : isCurrent
            ? "border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/30"
            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500",
          isClickable && "group-hover:border-green-400 cursor-pointer"
        )}
      >
        {isCompleted ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          <Icon className="h-5 w-5" />
        )}
      </span>
      <div className="mt-2 min-w-0">
        <span
          className={cn(
            "text-sm font-medium transition-colors",
            isCompleted
              ? "text-green-600 dark:text-green-400"
              : isCurrent
              ? "text-blue-600 dark:text-blue-400"
              : "text-slate-500 dark:text-slate-400",
            isClickable && "group-hover:text-green-500"
          )}
        >
          {step.name}
        </span>
        <p
          className={cn(
            "text-xs mt-0.5 transition-colors",
            isCurrent
              ? "text-slate-600 dark:text-slate-300"
              : "text-slate-400 dark:text-slate-500"
          )}
        >
          {step.description}
        </p>
      </div>
    </>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Clock, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useUpdateProviderOperatingHours } from "@/hooks/use-update-provider-hook";
import { useState, useEffect, useMemo } from "react";

const DAYS_OF_WEEK = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
];

interface OperatingHour {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isClosed: boolean;
}

// Helper function to convert 24-hour time to 12-hour format
function formatTimeTo12Hour(time24: string): string {
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12; // Convert 0 to 12 for midnight
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

interface ProviderOperatingHoursProps {
  provider: {
    id: string;
    operatingHours?: Array<{
      dayOfWeek: number;
      startTime: string | null;
      endTime: string | null;
      isClosed: boolean;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  };
}

export default function ProviderOperatingHours({ provider }: ProviderOperatingHoursProps) {
  const updateOperatingHours = useUpdateProviderOperatingHours();

  // Initialize operating hours directly from provider data
  const [operatingHours, setOperatingHours] = useState<OperatingHour[]>(() => {
    const providerHours = provider?.operatingHours;
    if (providerHours) {
      return DAYS_OF_WEEK.map((day) => {
        const existingHour = providerHours.find(
          (h) => h.dayOfWeek === day.value
        );

        if (existingHour) {
          // Use string times directly (already in "HH:MM" format)
          return {
            dayOfWeek: day.value,
            startTime: existingHour.startTime || "09:00",
            endTime: existingHour.endTime || "18:00",
            isClosed: existingHour.isClosed,
          };
        }

        // Default values for days without existing hours
        return {
          dayOfWeek: day.value,
          startTime: "09:00",
          endTime: "18:00",
          isClosed: day.value === 0, // Sunday closed by default
        };
      });
    }
    return [];
  });
  
  const [expandedDays, setExpandedDays] = useState<number[]>([1]); // Monday expanded by default

  // Check if form has changes
  const hasChanges = useMemo(() => {
    const providerHours = provider?.operatingHours;
    if (!providerHours) return false;

    return operatingHours.some((hour) => {
      const existingHour = providerHours.find(
        (h) => h.dayOfWeek === hour.dayOfWeek
      );

      if (!existingHour) return true;

      // Compare string times directly
      const existingStart = existingHour.startTime || "09:00";
      const existingEnd = existingHour.endTime || "18:00";

      return (
        hour.startTime !== existingStart ||
        hour.endTime !== existingEnd ||
        hour.isClosed !== existingHour.isClosed
      );
    });
  }, [operatingHours, provider]);

  const toggleDay = (dayOfWeek: number) => {
    setExpandedDays((prev) =>
      prev.includes(dayOfWeek)
        ? prev.filter((d) => d !== dayOfWeek)
        : [...prev, dayOfWeek]
    );
  };

  const updateHour = (
    dayOfWeek: number,
    field: "startTime" | "endTime" | "isClosed",
    value: string | boolean
  ) => {
    setOperatingHours((prev) =>
      prev.map((hour) =>
        hour.dayOfWeek === dayOfWeek ? { ...hour, [field]: value } : hour
      )
    );
  };

  // Auto-save when operating hours change
  useEffect(() => {
    if (!hasChanges || !provider?.operatingHours) return;

    // Set new timeout to save after 1 second of inactivity
    const timeout = setTimeout(() => {
      updateOperatingHours.mutate({
        operatingHours: operatingHours,
      });
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operatingHours, hasChanges]);

  return (
    <Card className="gap-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          <CardTitle className="text-slate-900 dark:text-white">Operating Hours</CardTitle>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Set your clinic&apos;s opening and closing times for each day
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Auto-save indicator */}
          {updateOperatingHours.isPending && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving changes...</span>
            </div>
          )}

          {DAYS_OF_WEEK.map((day) => {
            const hour = operatingHours.find((h) => h.dayOfWeek === day.value);
            const isExpanded = expandedDays.includes(day.value);

            if (!hour) return null;

            return (
              <div key={day.value} className="border border-slate-200 dark:border-white/10 rounded-lg p-4 bg-white dark:bg-slate-900">
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className="text-left flex items-center gap-2 flex-1"
                    >
                      <span className="font-medium text-slate-900 dark:text-white">{day.label}</span>
                      {!hour.isClosed && (
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {formatTimeTo12Hour(hour.startTime)} -{" "}
                          {formatTimeTo12Hour(hour.endTime)}
                        </span>
                      )}
                      {hour.isClosed && (
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Closed
                        </span>
                      )}
                    </button>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={!hour.isClosed}
                        onCheckedChange={(checked) =>
                          updateHour(day.value, "isClosed", !checked)
                        }
                      />
                      <button
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className="p-1"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Time Inputs */}
                {isExpanded && !hour.isClosed && (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`start-${day.value}`} className="text-slate-700 dark:text-slate-300">Opening Time</Label>
                      <Input
                        id={`start-${day.value}`}
                        type="time"
                        value={hour.startTime}
                        onChange={(e) =>
                          updateHour(day.value, "startTime", e.target.value)
                        }
                        className="bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`end-${day.value}`} className="text-slate-700 dark:text-slate-300">Closing Time</Label>
                      <Input
                        id={`end-${day.value}`}
                        type="time"
                        value={hour.endTime}
                        onChange={(e) =>
                          updateHour(day.value, "endTime", e.target.value)
                        }
                        className="bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {isExpanded && !hour.isClosed && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                    Changes are saved automatically when you finish editing
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

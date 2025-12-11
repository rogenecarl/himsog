// Cancellation reasons for users
export const USER_CANCELLATION_REASONS = [
  { value: "SCHEDULE_CONFLICT", label: "Schedule conflict" },
  { value: "FEELING_BETTER", label: "Feeling better" },
  { value: "FINANCIAL_REASONS", label: "Financial reasons" },
  { value: "FOUND_ANOTHER_PROVIDER", label: "Found another provider" },
  { value: "TRANSPORTATION_ISSUES", label: "Transportation issues" },
  { value: "PERSONAL_EMERGENCY", label: "Personal emergency" },
  { value: "OTHER", label: "Other" },
] as const;

// Cancellation reasons for providers
export const PROVIDER_CANCELLATION_REASONS = [
  { value: "PROVIDER_UNAVAILABLE", label: "Provider unavailable" },
  { value: "EMERGENCY_SITUATION", label: "Emergency situation" },
  { value: "SCHEDULING_ERROR", label: "Scheduling error" },
  { value: "FACILITY_ISSUES", label: "Facility issues" },
  { value: "WEATHER_SAFETY_CONCERNS", label: "Weather/safety concerns" },
  { value: "OTHER", label: "Other" },
] as const;

export type UserCancellationReason = typeof USER_CANCELLATION_REASONS[number]["value"];
export type ProviderCancellationReason = typeof PROVIDER_CANCELLATION_REASONS[number]["value"];

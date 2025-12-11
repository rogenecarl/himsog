// src/schemas/scheduling.schema.ts

import { z } from 'zod';

// ============================================================================
// OPERATING HOURS SCHEMA
// ============================================================================
export const OperatingHourSchema = z.object({
  id: z.string().uuid({ message: "Invalid UUID" }),
  providerId: z.string().uuid({ message: "Invalid provider UUID" }),
  dayOfWeek: z.number().int().min(0).max(6, { message: "Day of week must be between 0 (Sunday) and 6 (Saturday)" }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Start time must be in HH:MM format" }).nullable(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "End time must be in HH:MM format" }).nullable(),
  isClosed: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema for creating/updating operating hours
export const UpsertOperatingHourSchema = z.object({
  providerId: z.string().uuid({ message: "Invalid provider UUID" }),
  dayOfWeek: z.number().int().min(0).max(6, { message: "Day of week must be between 0 (Sunday) and 6 (Saturday)" }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Start time must be in HH:MM format" }).nullable(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "End time must be in HH:MM format" }).nullable(),
  isClosed: z.boolean().default(false),
}).refine((data) => {
  if (data.isClosed) return true;
  if (!data.startTime || !data.endTime) return false;
  
  const [startHour, startMin] = data.startTime.split(':').map(Number);
  const [endHour, endMin] = data.endTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  return endMinutes > startMinutes;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
});

// Schema for bulk update of operating hours (all days of the week)
export const BulkOperatingHoursSchema = z.object({
  providerId: z.string().uuid({ message: "Invalid provider UUID" }),
  hours: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).nullable(),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).nullable(),
      isClosed: z.boolean(),
    })
  ).length(7, { message: "Must provide hours for all 7 days of the week" }),
});

// ============================================================================
// BREAK TIME SCHEMA
// ============================================================================
export const BreakTimeSchema = z.object({
  id: z.string().uuid({ message: "Invalid UUID" }),
  providerId: z.string().uuid({ message: "Invalid provider UUID" }),
  name: z.string().default("Lunch Break"),
  dayOfWeek: z.number().int().min(0).max(6, { message: "Day of week must be between 0 (Sunday) and 6 (Saturday)" }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Start time must be in HH:MM format" }),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "End time must be in HH:MM format" }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema for creating a break time
export const CreateBreakTimeSchema = z.object({
  providerId: z.string().uuid({ message: "Invalid provider UUID" }),
  name: z.string()
    .min(2, { message: "Break name must be at least 2 characters long" })
    .max(100, { message: "Break name must be less than 100 characters" })
    .default("Lunch Break"),
  dayOfWeek: z.number().int().min(0).max(6, { message: "Day of week must be between 0 (Sunday) and 6 (Saturday)" }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Start time must be in HH:MM format" }),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "End time must be in HH:MM format" }),
}).refine((data) => {
  const [startHour, startMin] = data.startTime.split(':').map(Number);
  const [endHour, endMin] = data.endTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  return endMinutes > startMinutes;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
});

// Schema for updating a break time (all fields optional except providerId)
export const UpdateBreakTimeSchema = CreateBreakTimeSchema.partial().omit({ providerId: true });

// ============================================================================
// INFERRED TYPESCRIPT TYPES
// ============================================================================

export type OperatingHour = z.infer<typeof OperatingHourSchema>;
export type UpsertOperatingHourInput = z.infer<typeof UpsertOperatingHourSchema>;
export type BulkOperatingHoursInput = z.infer<typeof BulkOperatingHoursSchema>;

export type BreakTime = z.infer<typeof BreakTimeSchema>;
export type CreateBreakTimeInput = z.infer<typeof CreateBreakTimeSchema>;
export type UpdateBreakTimeInput = z.infer<typeof UpdateBreakTimeSchema>;

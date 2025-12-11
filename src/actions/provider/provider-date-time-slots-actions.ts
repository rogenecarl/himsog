"use server";

import prisma from "@/lib/prisma";
import { addMinutes, format, isAfter, isBefore, parse } from "date-fns";

interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}

interface AvailableSlots {
  date: string;
  dayOfWeek: number;
  isOperating: boolean;
  timeSlots: TimeSlot[];
  operatingHours?: {
    startTime: string;
    endTime: string;
  };
  breakTimes?: Array<{
    name: string;
    startTime: string;
    endTime: string;
  }>;
}

export async function getProviderAvailableSlots(
  providerId: string,
  dateString: string // Pass as string to avoid timezone serialization issues
): Promise<AvailableSlots> {
  try {
    // Parse the date string as local date (not UTC)
    // dateString format: "2025-11-21"
    const [year, month, day] = dateString.split('-').map(Number);
    const localDate = new Date(year, month - 1, day, 12, 0, 0, 0); // Create at noon to avoid edge cases
    const dayOfWeek = localDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Get provider's operating hours for this day
    console.log('🔍 Querying operating hours:', { providerId, dayOfWeek, dateString });
    
    const operatingHour = await prisma.operatingHour.findFirst({
      where: {
        providerId,
        dayOfWeek,
      },
    });

    console.log('📊 Found operating hour:', operatingHour ? {
      id: operatingHour.id,
      dayOfWeek: operatingHour.dayOfWeek,
      isClosed: operatingHour.isClosed,
      startTime: operatingHour.startTime,
      endTime: operatingHour.endTime,
    } : 'NOT FOUND');

    // If no operating hours or closed, return empty slots
    if (!operatingHour || operatingHour.isClosed || !operatingHour.startTime || !operatingHour.endTime) {
      return {
        date: dateString,
        dayOfWeek,
        isOperating: false,
        timeSlots: [],
      };
    }

    // Get provider's break times for this day
    const breakTimes = await prisma.breakTime.findMany({
      where: {
        providerId,
        dayOfWeek,
      },
    });

    // Get provider's slot duration
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      select: { slotDuration: true },
    });

    const slotDuration = provider?.slotDuration || 30; // Default 30 minutes

    // Get existing appointments for this date
    // IMPORTANT: Use Philippine timezone (UTC+8) to match how appointments are stored
    // Appointments are stored with +08:00 offset via createLocalDateTime()
    // So we must query using the same timezone to find correct matches
    const startOfSelectedDatePH = new Date(`${dateString}T00:00:00+08:00`);
    const endOfSelectedDatePH = new Date(`${dateString}T23:59:59+08:00`);

    console.log('🔍 Querying appointments for date range (PH timezone):', {
      dateString,
      startOfSelectedDatePH: startOfSelectedDatePH.toISOString(),
      endOfSelectedDatePH: endOfSelectedDatePH.toISOString(),
    });

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        providerId,
        startTime: {
          gte: startOfSelectedDatePH,
          lte: endOfSelectedDatePH,
        },
        status: {
          in: ["PENDING", "CONFIRMED"], // Only consider active appointments
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    console.log('📊 Found existing appointments:', existingAppointments.map(a => ({
      startTime: a.startTime.toISOString(),
      endTime: a.endTime.toISOString(),
    })));

    // Generate time slots
    const timeSlots: TimeSlot[] = [];
    // Times are now stored as strings in 24-hour format (e.g., "09:00", "17:00")
    const startTimeStr = operatingHour.startTime; // Already in "HH:mm" format
    const endTimeStr = operatingHour.endTime;     // Already in "HH:mm" format
    
    console.log('Operating hours (24-hour format):', {
      dayOfWeek,
      startTimeStr,
      endTimeStr
    });
    
    // Parse into Date objects with the selected date
    const startTime = parse(startTimeStr, "HH:mm", localDate);
    const endTime = parse(endTimeStr, "HH:mm", localDate);

    let currentSlot = startTime;

    while (isBefore(currentSlot, endTime)) {
      const slotEndTime = addMinutes(currentSlot, slotDuration);
      
      // Don't add slot if it would extend beyond operating hours
      if (isAfter(slotEndTime, endTime)) {
        break;
      }

      const timeString = format(currentSlot, "HH:mm");
      let available = true;
      let reason: string | undefined;

      // Check if slot conflicts with break times
      // Break times are now stored as strings in 24-hour format
      const isInBreakTime = breakTimes.some((breakTime) => {
        const breakStart = parse(breakTime.startTime, "HH:mm", localDate);
        const breakEnd = parse(breakTime.endTime, "HH:mm", localDate);
        
        return (
          (isBefore(currentSlot, breakEnd) && isAfter(slotEndTime, breakStart)) ||
          (currentSlot.getTime() === breakStart.getTime()) ||
          (slotEndTime.getTime() === breakEnd.getTime())
        );
      });

      if (isInBreakTime) {
        available = false;
        reason = "Break time";
      }

      // Check if slot conflicts with existing appointments
      // IMPORTANT: Create slot times with Philippine timezone (+08:00) to match stored appointments
      const hasAppointmentConflict = existingAppointments.some((appointment) => {
        const appointmentStart = appointment.startTime;
        const appointmentEnd = appointment.endTime;

        // Create slot start/end times with Philippine timezone offset
        const slotStartStr = `${dateString}T${timeString}:00+08:00`;
        const slotEndStr = `${dateString}T${format(slotEndTime, "HH:mm")}:00+08:00`;
        const slotStart = new Date(slotStartStr);
        const slotEnd = new Date(slotEndStr);

        const hasConflict = (
          (slotStart < appointmentEnd && slotEnd > appointmentStart) ||
          slotStart.getTime() === appointmentStart.getTime()
        );

        if (hasConflict) {
          console.log('⚠️ Conflict detected:', {
            slot: { start: slotStart.toISOString(), end: slotEnd.toISOString() },
            appointment: { start: appointmentStart.toISOString(), end: appointmentEnd.toISOString() }
          });
        }

        return hasConflict;
      });

      if (hasAppointmentConflict) {
        available = false;
        reason = "Already booked";
      }

      // Check if slot is in the past (for today's date)
      // Create slot time with Philippine timezone offset and compare against current UTC time
      const slotDateTimePH = new Date(`${dateString}T${timeString}:00+08:00`);

      if (slotDateTimePH <= new Date()) {
        available = false;
        reason = "Past time";
      }

      timeSlots.push({
        time: timeString,
        available,
        reason,
      });

      currentSlot = addMinutes(currentSlot, slotDuration);
    }

    return {
      date: dateString,
      dayOfWeek,
      isOperating: true,
      timeSlots,
      operatingHours: {
        startTime: startTimeStr,
        endTime: endTimeStr,
      },
      breakTimes: breakTimes.map((bt) => ({
        name: bt.name,
        startTime: bt.startTime, // Already in "HH:mm" format
        endTime: bt.endTime,     // Already in "HH:mm" format
      })),
    };
  } catch (error) {
    console.error("Error getting provider available slots:", error);
    throw new Error("Failed to get available time slots");
  }
}

export async function getProviderOperatingDays(providerId: string): Promise<number[]> {
  try {
    const operatingHours = await prisma.operatingHour.findMany({
      where: {
        providerId,
        isClosed: false,
        startTime: { not: null },
        endTime: { not: null },
      },
      select: {
        dayOfWeek: true,
      },
    });

    return operatingHours.map((oh) => oh.dayOfWeek);
  } catch (error) {
    console.error("Error getting provider operating days:", error);
    throw new Error("Failed to get operating days");
  }
}

// Helper function to check if a date is a valid booking date
export async function isValidBookingDate(
  providerId: string,
  dateString: string // Pass as string to avoid timezone serialization issues
): Promise<boolean> {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const localDate = new Date(year, month - 1, day, 12, 0, 0, 0);
    const dayOfWeek = localDate.getDay();

    // Use Philippine timezone for date comparisons
    const todayPH = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));
    const todayDateStr = `${todayPH.getFullYear()}-${String(todayPH.getMonth() + 1).padStart(2, '0')}-${String(todayPH.getDate()).padStart(2, '0')}`;

    // Can't book in the past (compare date strings to avoid timezone issues)
    if (dateString < todayDateStr) {
      return false;
    }

    // Check if provider operates on this day
    const operatingHour = await prisma.operatingHour.findFirst({
      where: {
        providerId,
        dayOfWeek,
        isClosed: false,
        startTime: { not: null },
        endTime: { not: null },
      },
    });

    return !!operatingHour;
  } catch (error) {
    console.error("Error checking valid booking date:", error);
    return false;
  }
}
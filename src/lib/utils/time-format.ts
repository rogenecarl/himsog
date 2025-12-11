/**
 * Utility functions for converting between 24-hour and 12-hour time formats
 */

/**
 * Convert 24-hour format to 12-hour format with AM/PM
 * @param time24 - Time in 24-hour format (e.g., "09:00", "17:30", "23:45")
 * @returns Time in 12-hour format with AM/PM (e.g., "9:00 AM", "5:30 PM", "11:45 PM")
 */
export function formatTime24to12(time24: string): string {
  if (!time24 || !time24.includes(':')) {
    return time24;
  }

  const [hoursStr, minutesStr] = time24.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (isNaN(hours) || isNaN(minutes)) {
    return time24;
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const displayMinutes = String(minutes).padStart(2, '0');

  return `${displayHours}:${displayMinutes} ${period}`;
}

/**
 * Convert 12-hour format with AM/PM to 24-hour format
 * @param time12 - Time in 12-hour format (e.g., "9:00 AM", "5:30 PM")
 * @returns Time in 24-hour format (e.g., "09:00", "17:30")
 */
export function formatTime12to24(time12: string): string {
  if (!time12 || !time12.includes(':')) {
    return time12;
  }

  const parts = time12.trim().split(' ');
  if (parts.length !== 2) {
    return time12;
  }

  const [timeStr, period] = parts;
  const [hoursStr, minutesStr] = timeStr.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (isNaN(hours) || isNaN(minutes)) {
    return time12;
  }

  const periodUpper = period.toUpperCase();

  // Convert to 24-hour format
  if (periodUpper === 'AM') {
    if (hours === 12) {
      hours = 0; // 12:00 AM is 00:00
    }
  } else if (periodUpper === 'PM') {
    if (hours !== 12) {
      hours += 12; // Add 12 for PM times except 12:00 PM
    }
  }

  const displayHours = String(hours).padStart(2, '0');
  const displayMinutes = String(minutes).padStart(2, '0');

  return `${displayHours}:${displayMinutes}`;
}

/**
 * Format a time range from 24-hour to 12-hour format
 * @param startTime - Start time in 24-hour format
 * @param endTime - End time in 24-hour format
 * @returns Formatted time range (e.g., "9:00 AM - 5:00 PM")
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatTime24to12(startTime)} - ${formatTime24to12(endTime)}`;
}

/**
 * Check if a time string is in valid 24-hour format (HH:mm)
 * @param time - Time string to validate
 * @returns true if valid, false otherwise
 */
export function isValidTime24(time: string): boolean {
  if (!time) return false;
  const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(time);
}

/**
 * Check if a time string is in valid 12-hour format (h:mm AM/PM)
 * @param time - Time string to validate
 * @returns true if valid, false otherwise
 */
export function isValidTime12(time: string): boolean {
  if (!time) return false;
  const regex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM|am|pm)$/;
  return regex.test(time);
}

/**
 * Create a Date object from date and time components in Philippines timezone (UTC+8)
 * This ensures consistent timezone handling across localhost and production
 * @param date - The date object
 * @param timeString - Time in 24-hour format (HH:mm)
 * @returns Date object representing the Philippines local time
 */
export function createLocalDateTime(date: Date, timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  
  // Create a date string in ISO format with Philippines timezone offset (UTC+8)
  // This ensures the database stores the exact time we want, regardless of server location
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hoursStr = String(hours).padStart(2, '0');
  const minutesStr = String(minutes).padStart(2, '0');
  
  // HARDCODED: Philippines timezone is always UTC+8
  // Format: YYYY-MM-DDTHH:mm:ss+08:00
  // This tells PostgreSQL: "This is 10:30 AM in UTC+8 (Philippines), store it accordingly"
  const isoString = `${year}-${month}-${day}T${hoursStr}:${minutesStr}:00+08:00`;
  
  return new Date(isoString);
}

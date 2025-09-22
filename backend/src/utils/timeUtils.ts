import { PickupHours } from '../types/store.types';
import { toZonedTime, format } from 'date-fns-tz';
import { ENV } from '../config/env';

/**
 * Get current day of week in the format used by pickup hours
 * Uses configured timezone (Argentina) to determine the correct day
 * @returns Day string ('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun')
 */
export const getCurrentDayOfWeek = (): string => {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const now = new Date();
  const zonedTime = toZonedTime(now, ENV.TIMEZONE);
  return days[zonedTime.getDay()];
};

/**
 * Check if current time is within the specified range
 * Uses configured timezone (Argentina) to get the correct local time
 * @param openTime Time string in HH:mm format (e.g., "09:00")
 * @param closeTime Time string in HH:mm format (e.g., "18:00")
 * @returns True if current time is within the range
 */
export const isCurrentTimeInRange = (openTime: string, closeTime: string): boolean => {
  const now = new Date();
  const zonedTime = toZonedTime(now, ENV.TIMEZONE);
  const currentTime = format(zonedTime, 'HH:mm', { timeZone: ENV.TIMEZONE }); // Get HH:mm format in Argentina timezone
  
  // Handle closed store (indicated by "00:00" open time)
  if (openTime === '00:00' && closeTime === '00:00') {
    return false;
  }
  
  // Convert time strings to minutes for easier comparison
  const currentMinutes = timeStringToMinutes(currentTime);
  const openMinutes = timeStringToMinutes(openTime);
  const closeMinutes = timeStringToMinutes(closeTime);
  
  // Handle same-day hours (e.g., 09:00 - 18:00)
  if (closeMinutes > openMinutes) {
    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  }
  
  // Handle overnight hours (e.g., 22:00 - 06:00)
  if (closeMinutes < openMinutes) {
    return currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
  }
  
  // Handle 24-hour operation (open and close are the same)
  if (closeMinutes === openMinutes) {
    return true;
  }
  
  return false;
};

/**
 * Convert time string (HH:mm) to minutes since midnight
 * @param timeString Time in HH:mm format
 * @returns Minutes since midnight
 */
const timeStringToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Calculate if a store should be open based on its pickup hours and current time
 * @param pickupHours Array of pickup hours for each day
 * @returns True if store should be open now
 */
export const calculateStoreOpenStatus = (pickupHours: PickupHours): boolean => {
  const currentDay = getCurrentDayOfWeek();
  
  // Find today's hours
  const todayHours = pickupHours.find(hours => hours.day === currentDay);
  
  // If no hours defined for today, store is closed
  if (!todayHours) {
    return false;
  }
  
  // Check if current time falls within today's hours
  return isCurrentTimeInRange(todayHours.open, todayHours.close);
};

/**
 * Get a readable timestamp for logging
 * Uses configured timezone (Argentina) for local timestamp
 * @returns Formatted timestamp string
 */
export const getTimestamp = (): string => {
  const now = new Date();
  const zonedTime = toZonedTime(now, ENV.TIMEZONE);
  return format(zonedTime, 'yyyy-MM-dd HH:mm:ss zzz', { timeZone: ENV.TIMEZONE });
};

/**
 * Check if a time string is valid (HH:mm format)
 * @param timeString Time string to validate
 * @returns True if valid time format
 */
export const isValidTimeString = (timeString: string): boolean => {
  const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
  return timeRegex.test(timeString);
};
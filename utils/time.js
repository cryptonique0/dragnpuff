/**
 * Time & Date Utilities
 * Provides helper functions for time operations
 */

/**
 * Get current timestamp
 * @returns {number} Current Unix timestamp in seconds
 */
function now() {
  return Math.floor(Date.now() / 1000);
}

/**
 * Format seconds to readable time
 * @param {number} seconds - Seconds to format
 * @returns {string} Formatted time string
 */
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

/**
 * Get relative time string
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Relative time (e.g., "2 hours ago")
 */
function getRelativeTime(timestamp) {
  const seconds = now() - timestamp;

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return new Date(timestamp * 1000).toLocaleDateString();
}

/**
 * Convert date to Unix timestamp
 * @param {Date} date - Date object
 * @returns {number} Unix timestamp in seconds
 */
function dateToTimestamp(date) {
  return Math.floor(date.getTime() / 1000);
}

/**
 * Convert Unix timestamp to date
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {Date} Date object
 */
function timestampToDate(timestamp) {
  return new Date(timestamp * 1000);
}

/**
 * Add seconds to timestamp
 * @param {number} timestamp - Base timestamp
 * @param {number} seconds - Seconds to add
 * @returns {number} New timestamp
 */
function addSeconds(timestamp, seconds) {
  return timestamp + seconds;
}

/**
 * Add minutes to timestamp
 * @param {number} timestamp - Base timestamp
 * @param {number} minutes - Minutes to add
 * @returns {number} New timestamp
 */
function addMinutes(timestamp, minutes) {
  return timestamp + minutes * 60;
}

/**
 * Add hours to timestamp
 * @param {number} timestamp - Base timestamp
 * @param {number} hours - Hours to add
 * @returns {number} New timestamp
 */
function addHours(timestamp, hours) {
  return timestamp + hours * 3600;
}

/**
 * Add days to timestamp
 * @param {number} timestamp - Base timestamp
 * @param {number} days - Days to add
 * @returns {number} New timestamp
 */
function addDays(timestamp, days) {
  return timestamp + days * 86400;
}

/**
 * Check if timestamp is in the past
 * @param {number} timestamp - Timestamp to check
 * @returns {boolean} True if in the past
 */
function isPast(timestamp) {
  return timestamp < now();
}

/**
 * Check if timestamp is in the future
 * @param {number} timestamp - Timestamp to check
 * @returns {boolean} True if in the future
 */
function isFuture(timestamp) {
  return timestamp > now();
}

/**
 * Get time until timestamp
 * @param {number} timestamp - Target timestamp
 * @returns {number} Seconds until timestamp
 */
function timeUntil(timestamp) {
  return Math.max(0, timestamp - now());
}

/**
 * Check if timestamp is today
 * @param {number} timestamp - Timestamp to check
 * @returns {boolean} True if today
 */
function isToday(timestamp) {
  const today = new Date();
  const date = new Date(timestamp * 1000);
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

module.exports = {
  now,
  formatTime,
  getRelativeTime,
  dateToTimestamp,
  timestampToDate,
  addSeconds,
  addMinutes,
  addHours,
  addDays,
  isPast,
  isFuture,
  timeUntil,
  isToday,
};

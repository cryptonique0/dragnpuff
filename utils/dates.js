/**
 * Date Utility Functions
 */

/**
 * Format timestamp as relative time (e.g., "2 hours ago")
 * @param {number|Date} timestamp - Unix timestamp or Date object
 * @returns {string}
 */
function formatRelativeTime(timestamp) {
  const date = typeof timestamp === "number" ? new Date(timestamp * 1000) : timestamp;
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return date.toLocaleDateString();
}

/**
 * Get start of day timestamp
 * @param {Date} date - Optional date (default: today)
 * @returns {number}
 */
function getStartOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

/**
 * Get end of day timestamp
 * @param {Date} date - Optional date (default: today)
 * @returns {number}
 */
function getEndOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return Math.floor(d.getTime() / 1000);
}

/**
 * Check if date is within last N days
 * @param {number} timestamp - Unix timestamp
 * @param {number} days - Number of days
 * @returns {boolean}
 */
function isWithinLastDays(timestamp, days) {
  const now = Math.floor(Date.now() / 1000);
  const secondsAgo = now - timestamp;
  return secondsAgo < days * 86400;
}

module.exports = {
  formatRelativeTime,
  getStartOfDay,
  getEndOfDay,
  isWithinLastDays,
};

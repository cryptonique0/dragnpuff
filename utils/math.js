/**
 * Mathematical Utility Functions
 */

/**
 * Calculate percentage of a number
 * @param {number} value - The value
 * @param {number} percent - The percentage
 * @returns {number}
 */
function calculatePercent(value, percent) {
  return (value * percent) / 100;
}

/**
 * Get percentage change between two values
 * @param {number} oldValue - Original value
 * @param {number} newValue - New value
 * @returns {number}
 */
function percentageChange(oldValue, newValue) {
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number}
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculate weighted average
 * @param {array} values - Array of values
 * @param {array} weights - Array of weights
 * @returns {number}
 */
function weightedAverage(values, weights) {
  const sum = values.reduce((acc, val, idx) => acc + val * weights[idx], 0);
  const weightSum = weights.reduce((a, b) => a + b, 0);
  return sum / weightSum;
}

/**
 * Linear interpolation
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number}
 */
function lerp(a, b, t) {
  return a + (b - a) * t;
}

module.exports = {
  calculatePercent,
  percentageChange,
  clamp,
  weightedAverage,
  lerp,
};

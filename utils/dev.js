/**
 * Development Utility Functions
 */

/**
 * Log object with pretty formatting
 * @param {object} obj - Object to log
 */
function logObject(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

/**
 * Measure function execution time
 * @param {Function} fn - Function to measure
 * @param {string} label - Label for timing
 * @returns {Promise<any>}
 */
async function measureTime(fn, label = "Execution") {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    console.log(`${label} took ${duration}ms`);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.log(`${label} failed after ${duration}ms`);
    throw error;
  }
}

/**
 * Debug log (only in development)
 * @param {string} message - Message to log
 * @param {any} data - Optional data
 */
function debug(message, data = null) {
  if (process.env.DEBUG) {
    if (data) {
      console.log(`[DEBUG] ${message}`, data);
    } else {
      console.log(`[DEBUG] ${message}`);
    }
  }
}

module.exports = {
  logObject,
  measureTime,
  debug,
};

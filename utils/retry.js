/**
 * Retry Mechanism Utility
 */

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {object} options - Retry options
 * @returns {Promise}
 */
async function retry(fn, options = {}) {
  const { maxRetries = 3, delay = 1000, backoff = 2, onRetry = null } = options;

  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const waitTime = delay * Math.pow(backoff, i);
        if (onRetry) onRetry(i + 1, error, waitTime);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError;
}

module.exports = {
  retry,
};

/**
 * Rate Limiting Utility
 */

class RateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  isAllowed(key) {
    const now = Date.now();
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }

    const timestamps = this.requests.get(key);
    const validTimestamps = timestamps.filter((t) => t > now - this.windowMs);

    if (validTimestamps.length < this.maxRequests) {
      validTimestamps.push(now);
      this.requests.set(key, validTimestamps);
      return true;
    }

    return false;
  }

  getRemaining(key) {
    const now = Date.now();
    if (!this.requests.has(key)) return this.maxRequests;

    const timestamps = this.requests.get(key).filter((t) => t > now - this.windowMs);
    return Math.max(0, this.maxRequests - timestamps.length);
  }
}

function createRateLimiter(maxRequests = 100, windowMs = 60000) {
  return new RateLimiter(maxRequests, windowMs);
}

module.exports = {
  RateLimiter,
  createRateLimiter,
};

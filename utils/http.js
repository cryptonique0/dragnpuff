/**
 * HTTP Client Utility
 */

/**
 * Make HTTP request
 * @param {string} url - Request URL
 * @param {object} options - Request options
 * @returns {Promise<object>}
 */
async function request(url, options = {}) {
  const { method = "GET", headers = {}, body = null, timeout = 30000 } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : null,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * GET request helper
 * @param {string} url - Request URL
 * @param {object} options - Request options
 * @returns {Promise<object>}
 */
function get(url, options = {}) {
  return request(url, { ...options, method: "GET" });
}

/**
 * POST request helper
 * @param {string} url - Request URL
 * @param {object} body - Request body
 * @param {object} options - Request options
 * @returns {Promise<object>}
 */
function post(url, body, options = {}) {
  return request(url, { ...options, method: "POST", body });
}

module.exports = {
  request,
  get,
  post,
};

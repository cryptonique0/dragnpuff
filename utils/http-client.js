/**
 * HTTP Request Utilities
 * Provides helper functions for making HTTP requests with retries, timeouts, and error handling
 */

const http = require("http");
const https = require("https");

/**
 * Make HTTP GET request
 * @param {string} url - URL to request
 * @param {object} options - Request options (timeout, headers, etc.)
 * @returns {Promise<any>} Response data
 */
async function get(url, options = {}) {
  const { timeout = 30000, headers = {}, retries = 3 } = options;
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      return await makeRequest(url, {
        method: "GET",
        timeout,
        headers,
      });
    } catch (error) {
      lastError = error;
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  throw lastError;
}

/**
 * Make HTTP POST request
 * @param {string} url - URL to request
 * @param {object} data - Data to send
 * @param {object} options - Request options
 * @returns {Promise<any>} Response data
 */
async function post(url, data, options = {}) {
  const { timeout = 30000, headers = {}, retries = 3 } = options;
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      return await makeRequest(url, {
        method: "POST",
        timeout,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      lastError = error;
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  throw lastError;
}

/**
 * Make HTTP request
 * @private
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === "https:";
    const client = isHttps ? https : http;

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || "GET",
      timeout: options.timeout || 30000,
      headers: options.headers || {},
    };

    const request = client.request(requestOptions, (response) => {
      let data = "";

      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", () => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${response.statusCode}: ${data}`));
        }
      });
    });

    request.on("error", reject);
    request.on("timeout", () => {
      request.destroy();
      reject(new Error("Request timeout"));
    });

    if (options.body) {
      request.write(options.body);
    }

    request.end();
  });
}

/**
 * Fetch with timeout and retries
 * @param {string} url - URL to fetch
 * @param {object} options - Fetch options
 * @returns {Promise<any>} Response data
 */
async function fetch(url, options = {}) {
  const { timeout = 30000, retries = 3 } = options;

  if (options.method === "POST" || options.method === "PUT") {
    return post(url, options.body, { timeout, retries, headers: options.headers });
  }

  return get(url, { timeout, retries, headers: options.headers });
}

/**
 * Batch requests with concurrency limit
 * @param {Array<string>} urls - URLs to fetch
 * @param {number} concurrency - Max concurrent requests
 * @returns {Promise<Array>} Results
 */
async function batchRequests(urls, concurrency = 5) {
  const results = [];
  const executing = [];

  for (const url of urls) {
    const promise = get(url).then((result) => results.push(result));

    executing.push(promise);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
      executing.splice(
        executing.findIndex((p) => p === promise),
        1
      );
    }
  }

  await Promise.all(executing);
  return results;
}

module.exports = {
  get,
  post,
  fetch,
  makeRequest,
  batchRequests,
};

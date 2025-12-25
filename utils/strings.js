/**
 * String Utility Functions
 */

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string}
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert to camelCase
 * @param {string} str - String to convert
 * @returns {string}
 */
function toCamelCase(str) {
  return str.replace(/[-_\s](.)/g, (_, c) => c.toUpperCase());
}

/**
 * Convert to snake_case
 * @param {string} str - String to convert
 * @returns {string}
 */
function toSnakeCase(str) {
  return str.replace(/([A-Z])/g, "_$1").toLowerCase();
}

/**
 * Truncate string with ellipsis
 * @param {string} str - String to truncate
 * @param {number} length - Max length
 * @returns {string}
 */
function truncate(str, length) {
  return str.length > length ? str.slice(0, length) + "..." : str;
}

/**
 * Remove whitespace
 * @param {string} str - String to clean
 * @returns {string}
 */
function removeWhitespace(str) {
  return str.replace(/\s/g, "");
}

module.exports = {
  capitalize,
  toCamelCase,
  toSnakeCase,
  truncate,
  removeWhitespace,
};

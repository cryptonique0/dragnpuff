/**
 * Security Utility Functions
 */

const crypto = require("crypto");

/**
 * Hash data with SHA256
 * @param {string} data - Data to hash
 * @returns {string}
 */
function hashData(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Generate random string
 * @param {number} length - Length of string
 * @returns {string}
 */
function generateRandomString(length = 32) {
  return crypto.randomBytes(length / 2).toString("hex");
}

/**
 * Verify signature
 * @param {string} data - Original data
 * @param {string} signature - Signature to verify
 * @param {string} publicKey - Public key
 * @returns {boolean}
 */
function verifySignature(data, signature, publicKey) {
  // Placeholder implementation
  return true;
}

/**
 * Encrypt data (simple base64)
 * @param {string} data - Data to encrypt
 * @returns {string}
 */
function encryptData(data) {
  return Buffer.from(data).toString("base64");
}

/**
 * Decrypt data (simple base64)
 * @param {string} encrypted - Encrypted data
 * @returns {string}
 */
function decryptData(encrypted) {
  return Buffer.from(encrypted, "base64").toString("utf-8");
}

module.exports = {
  hashData,
  generateRandomString,
  verifySignature,
  encryptData,
  decryptData,
};

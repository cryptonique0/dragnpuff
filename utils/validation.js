/**
 * Address and Data Validation Utilities
 */

const { ethers } = require("ethers");

/**
 * Validate Ethereum address
 * @param {string} address - Address to validate
 * @returns {boolean}
 */
function isValidAddress(address) {
  return ethers.isAddress(address);
}

/**
 * Validate and checksum address
 * @param {string} address - Address to validate
 * @returns {string|null}
 */
function validateAddress(address) {
  try {
    return ethers.getAddress(address);
  } catch {
    return null;
  }
}

/**
 * Check if address is null address
 * @param {string} address - Address to check
 * @returns {boolean}
 */
function isNullAddress(address) {
  return address === ethers.ZeroAddress;
}

/**
 * Validate transaction hash
 * @param {string} hash - Transaction hash
 * @returns {boolean}
 */
function isValidTransactionHash(hash) {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Validate Farcaster FID
 * @param {number} fid - Farcaster ID
 * @returns {boolean}
 */
function isValidFID(fid) {
  return Number.isInteger(fid) && fid > 0;
}

/**
 * Validate uint256 value
 * @param {string|number} value - Value to validate
 * @returns {boolean}
 */
function isValidUint256(value) {
  try {
    ethers.toBeHex(BigInt(value), 32);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  isValidAddress,
  validateAddress,
  isNullAddress,
  isValidTransactionHash,
  isValidFID,
  isValidUint256,
};

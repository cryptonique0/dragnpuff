/**
 * Data Formatter Utilities
 */

const { ethers } = require("ethers");

/**
 * Format Ether value
 * @param {string|bigint} wei - Amount in Wei
 * @param {number} decimals - Decimal places (default: 2)
 * @returns {string}
 */
function formatEth(wei, decimals = 2) {
  const eth = parseFloat(ethers.formatEther(wei));
  return eth.toFixed(decimals);
}

/**
 * Format address for display
 * @param {string} address - Full address
 * @param {number} chars - Characters to show (default: 6)
 * @returns {string}
 */
function formatAddress(address, chars = 6) {
  if (!address || address.length < chars * 2) {
    return address;
  }
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Format large number with commas
 * @param {number} num - Number to format
 * @returns {string}
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Format percentage
 * @param {number} value - Value (0-1 or 0-100)
 * @param {number} decimals - Decimal places (default: 2)
 * @returns {string}
 */
function formatPercent(value, decimals = 2) {
  const percent = value > 1 ? value : value * 100;
  return `${percent.toFixed(decimals)}%`;
}

/**
 * Format timestamp to readable date
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {string}
 */
function formatDate(timestamp) {
  return new Date(timestamp * 1000).toLocaleDateString();
}

module.exports = {
  formatEth,
  formatAddress,
  formatNumber,
  formatPercent,
  formatDate,
};

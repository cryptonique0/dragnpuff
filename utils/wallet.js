/**
 * Wallet Utility Functions
 */

const { ethers } = require("ethers");

/**
 * Create wallet from private key
 * @param {string} privateKey - Private key
 * @returns {object}
 */
function createWallet(privateKey) {
  try {
    return new ethers.Wallet(privateKey);
  } catch (error) {
    throw new Error("Invalid private key");
  }
}

/**
 * Get wallet address
 * @param {object} wallet - Ethers wallet
 * @returns {string}
 */
function getAddress(wallet) {
  return wallet.address;
}

/**
 * Check if string is valid private key
 * @param {string} privateKey - Private key to check
 * @returns {boolean}
 */
function isValidPrivateKey(privateKey) {
  try {
    new ethers.Wallet(privateKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sign message
 * @param {object} wallet - Ethers wallet
 * @param {string} message - Message to sign
 * @returns {Promise<string>}
 */
async function signMessage(wallet, message) {
  return wallet.signMessage(message);
}

module.exports = {
  createWallet,
  getAddress,
  isValidPrivateKey,
  signMessage,
};

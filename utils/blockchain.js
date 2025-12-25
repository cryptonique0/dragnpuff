/**
 * Blockchain Utility Functions
 */

const { ethers } = require("ethers");

/**
 * Get current block number
 * @param {object} provider - Ethers provider
 * @returns {Promise<number>}
 */
async function getCurrentBlockNumber(provider) {
  return provider.getBlockNumber();
}

/**
 * Get account balance in ETH
 * @param {object} provider - Ethers provider
 * @param {string} address - Account address
 * @returns {Promise<string>}
 */
async function getBalance(provider, address) {
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
}

/**
 * Estimate gas for transaction
 * @param {object} tx - Transaction object
 * @param {object} signer - Ethers signer
 * @returns {Promise<string>}
 */
async function estimateGas(tx, signer) {
  try {
    const gas = await signer.estimateGas(tx);
    return gas.toString();
  } catch (error) {
    console.error("Gas estimation failed:", error.message);
    return null;
  }
}

/**
 * Wait for transaction receipt
 * @param {object} provider - Ethers provider
 * @param {string} txHash - Transaction hash
 * @param {number} confirmations - Required confirmations (default: 1)
 * @returns {Promise<object>}
 */
async function waitForTransaction(provider, txHash, confirmations = 1) {
  return provider.waitForTransaction(txHash, confirmations);
}

/**
 * Convert Wei to ETH
 * @param {string} wei - Amount in Wei
 * @returns {string}
 */
function weiToEth(wei) {
  return ethers.formatEther(wei);
}

/**
 * Convert ETH to Wei
 * @param {string} eth - Amount in ETH
 * @returns {string}
 */
function ethToWei(eth) {
  return ethers.parseEther(eth).toString();
}

module.exports = {
  getCurrentBlockNumber,
  getBalance,
  estimateGas,
  waitForTransaction,
  weiToEth,
  ethToWei,
};

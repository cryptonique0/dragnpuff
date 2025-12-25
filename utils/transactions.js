/**
 * Transaction Utility Functions
 */

const { ethers } = require("ethers");

/**
 * Create transaction object
 * @param {object} data - Transaction data
 * @returns {object}
 */
function createTransaction(data) {
  return {
    to: data.to,
    from: data.from,
    value: data.value || "0",
    data: data.data || "0x",
    gasLimit: data.gasLimit || null,
    gasPrice: data.gasPrice || null,
    nonce: data.nonce || null,
  };
}

/**
 * Parse transaction response
 * @param {object} txResponse - Transaction response from ethers
 * @returns {object}
 */
function parseTransaction(txResponse) {
  return {
    hash: txResponse.hash,
    from: txResponse.from,
    to: txResponse.to,
    value: ethers.formatEther(txResponse.value),
    gasLimit: txResponse.gasLimit.toString(),
    gasPrice: ethers.formatUnits(txResponse.gasPrice, "gwei"),
    nonce: txResponse.nonce,
    blockNumber: txResponse.blockNumber,
    timestamp: txResponse.timestamp,
  };
}

/**
 * Calculate transaction cost
 * @param {bigint} gasUsed - Gas used
 * @param {bigint} gasPrice - Gas price in Wei
 * @returns {string}
 */
function calculateTransactionCost(gasUsed, gasPrice) {
  const cost = gasUsed * gasPrice;
  return ethers.formatEther(cost);
}

module.exports = {
  createTransaction,
  parseTransaction,
  calculateTransactionCost,
};

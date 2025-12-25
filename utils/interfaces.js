/**
 * Smart Contract Interface Utilities
 */

const { ethers } = require("ethers");

/**
 * Load contract ABI from file
 * @param {string} path - Path to ABI JSON file
 * @returns {object} Contract ABI
 */
function loadABI(path) {
  try {
    return require(path);
  } catch (error) {
    console.error(`Failed to load ABI from ${path}:`, error.message);
    return null;
  }
}

/**
 * Create contract instance
 * @param {string} address - Contract address
 * @param {object} abi - Contract ABI
 * @param {object} signer - Ethers signer
 * @returns {object} Contract instance
 */
function createContractInstance(address, abi, signer) {
  if (!ethers.isAddress(address)) {
    throw new Error(`Invalid contract address: ${address}`);
  }
  return new ethers.Contract(address, abi, signer);
}

/**
 * Decode contract event
 * @param {object} log - Event log
 * @param {object} abi - Contract ABI
 * @returns {object} Decoded event data
 */
function decodeEvent(log, abi) {
  const iface = new ethers.Interface(abi);
  try {
    return iface.parseLog(log);
  } catch (error) {
    console.error("Failed to decode event:", error.message);
    return null;
  }
}

/**
 * Encode contract function call
 * @param {object} abi - Contract ABI
 * @param {string} functionName - Function name
 * @param {array} args - Function arguments
 * @returns {string} Encoded function call
 */
function encodeFunctionCall(abi, functionName, args) {
  const iface = new ethers.Interface(abi);
  return iface.encodeFunctionData(functionName, args);
}

module.exports = {
  loadABI,
  createContractInstance,
  decodeEvent,
  encodeFunctionCall,
};

/**
 * Testing Utility Functions
 */

/**
 * Create mock contract
 * @param {object} methods - Contract methods
 * @returns {object}
 */
function createMockContract(methods = {}) {
  return {
    ...methods,
    address: "0x0000000000000000000000000000000000000000",
  };
}

/**
 * Create mock signer
 * @param {object} config - Signer configuration
 * @returns {object}
 */
function createMockSigner(config = {}) {
  return {
    address: config.address || "0x0000000000000000000000000000000000000000",
    getAddress: async () => config.address || "0x0000000000000000000000000000000000000000",
    signMessage: async (message) => "0xmocksignature",
    signTransaction: async (tx) => "0xmocksignature",
  };
}

/**
 * Create mock provider
 * @returns {object}
 */
function createMockProvider() {
  return {
    getBlockNumber: async () => 1000000,
    getBalance: async () => "1000000000000000000",
    getCode: async () => "0x",
    call: async () => "0x",
  };
}

/**
 * Assert equality in tests
 * @param {any} actual - Actual value
 * @param {any} expected - Expected value
 * @param {string} message - Error message
 */
function assertEqual(actual, expected, message = "") {
  if (actual !== expected) {
    throw new Error(`Assertion failed: ${message}\nExpected: ${expected}\nActual: ${actual}`);
  }
}

module.exports = {
  createMockContract,
  createMockSigner,
  createMockProvider,
  assertEqual,
};

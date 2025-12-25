/**
 * Network Configuration Constants
 */

module.exports = {
  NETWORKS: {
    MAINNET: {
      chainId: 1,
      name: "Ethereum Mainnet",
      rpc: "https://eth-mainnet.g.alchemy.com/v2/",
      explorer: "https://etherscan.io",
    },
    SEPOLIA: {
      chainId: 11155111,
      name: "Sepolia Testnet",
      rpc: "https://eth-sepolia.g.alchemy.com/v2/",
      explorer: "https://sepolia.etherscan.io",
    },
    BASE_MAINNET: {
      chainId: 8453,
      name: "Base",
      rpc: "https://mainnet.base.org",
      explorer: "https://basescan.org",
    },
    BASE_SEPOLIA: {
      chainId: 84531,
      name: "Base Sepolia",
      rpc: "https://sepolia.base.org",
      explorer: "https://sepolia.basescan.org",
    },
  },

  DEFAULT_NETWORK: "BASE_MAINNET",

  // RPC Configuration
  RPC_TIMEOUT: 30000,
  RPC_RETRIES: 3,
  RPC_RETRY_DELAY: 1000,
};

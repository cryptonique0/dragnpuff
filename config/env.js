/**
 * Environment Configuration
 * Centralized environment variable management
 */

module.exports = {
  // Network
  network: process.env.DEPLOYMENT_NETWORK || "hardhat",
  rpc: {
    base: process.env.BASE_RPC_URL || "https://mainnet.base.org",
    baseSepolia: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
  },

  // Deployment
  deployment: {
    gasPrice: process.env.GAS_PRICE || "5",
    gasLimit: process.env.GAS_LIMIT || "8000000",
    confirmations: process.env.CONFIRMATIONS || "5",
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || "info",
    verbose: process.env.VERBOSE === "true",
  },

  // Development
  development: {
    enableDebug: process.env.DEBUG === "true",
    mockData: process.env.MOCK_DATA === "true",
  },

  // API
  api: {
    baseUrl: process.env.API_BASE_URL || "http://localhost:3000",
    timeout: parseInt(process.env.API_TIMEOUT || "30000"),
  },

  // Firebase
  firebase: {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
  },

  // Contracts
  contracts: {
    dragnpuff: process.env.VITE_DRAGN_CONTRACT,
    minter: process.env.VITE_MINTER_ADDRESS,
    fairToken: process.env.VITE_FAIR_TOKEN_ADDRESS,
    airdrop: process.env.VITE_AIRDROP_ADDRESS,
  },
};

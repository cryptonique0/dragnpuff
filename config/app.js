/**
 * Application Configuration
 * Global application settings
 */

module.exports = {
  // Application
  app: {
    name: "DragNPuff",
    version: "1.0.0",
    description: "A Web3 gaming experience on Base network",
    url: "https://dragnpuff.xyz",
  },

  // Features
  features: {
    minting: true,
    trading: true,
    staking: true,
    governance: true,
    analytics: true,
    notifications: true,
  },

  // Game settings
  game: {
    maxPuffs: 10000,
    initialBalance: "1000000000000000000", // 1 ETH
    rewardPerWin: "100000000000000000", // 0.1 ETH
    minWagerAmount: "1000000000000000", // 0.001 ETH
  },

  // Token settings
  token: {
    totalSupply: "1000000000000000000000000", // 1M tokens
    decimals: 18,
    transferFee: 0, // 0%
    burnOnTransfer: false,
  },

  // Security
  security: {
    enableRateLimit: true,
    rateLimitWindow: 60000, // 1 minute
    rateLimitRequests: 100,
    enableXSSProtection: true,
    enableCSRFProtection: true,
  },

  // UI/UX
  ui: {
    theme: "dark",
    animationsEnabled: true,
    soundEnabled: true,
    language: "en",
  },

  // Performance
  performance: {
    cacheEnabled: true,
    cacheTTL: 300000, // 5 minutes
    compressionEnabled: true,
  },

  // Notifications
  notifications: {
    enabled: true,
    email: true,
    push: true,
    inApp: true,
  },

  // Logging
  logging: {
    level: "info",
    format: "json",
    destinations: ["console", "file"],
  },
};

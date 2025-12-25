/**
 * Deployment Configuration
 * Configuration for different network deployments
 */

module.exports = {
  networks: {
    base: {
      chainId: 8453,
      name: "Base",
      rpc: "https://mainnet.base.org",
      explorer: "https://basescan.org",
      testnet: false,
      confirmations: 5,
      gasPrice: "5", // gwei
    },
    baseSepolia: {
      chainId: 84532,
      name: "Base Sepolia",
      rpc: "https://sepolia.base.org",
      explorer: "https://sepolia.basescan.org",
      testnet: true,
      confirmations: 2,
      gasPrice: "2", // gwei
    },
    hardhat: {
      chainId: 8453,
      name: "Hardhat",
      rpc: "http://127.0.0.1:8545",
      explorer: "N/A",
      testnet: true,
      confirmations: 1,
      gasPrice: "0",
    },
  },

  defaultNetwork: "hardhat",

  deployment: {
    // Constructor arguments for contracts
    DragNPuff: {
      name: "DragN'Puff",
      symbol: "DRAGN",
      baseURI: "https://dragnpuff.xyz/metadata/",
    },

    FairToken: {
      name: "Fair Token",
      symbol: "FAIR",
      initialSupply: "1000000", // 1 million tokens
    },

    ERC721Minter: {
      minterFeeHolder: "1000000000000000", // 0.001 ETH
      minterFeePublic: "2000000000000000", // 0.002 ETH
    },

    Airdrop: {
      // Airdrop configuration
      baseAmount: "100000000000000000", // 0.1 ETH
    },
  },

  // Gas configurations
  gas: {
    standard: "50000",
    moderate: "100000",
    high: "300000",
  },

  // Verification
  verification: {
    baseScan: {
      apiUrl: "https://api.basescan.org/api",
      enabled: true,
    },
  },
};

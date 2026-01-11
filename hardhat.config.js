require("@nomicfoundation/hardhat-toolbox");
const dot = require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";
// Support both new and legacy env var names for RPC URLs
const API_URL_BASE = process.env.BASE_RPC_URL || process.env.API_URL_BASE || "https://mainnet.base.org";
const API_URL_BASESEPOLIA = process.env.BASE_SEPOLIA_RPC_URL || process.env.API_URL_BASESEPOLIA || "https://sepolia.base.org";
const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000
          },
          viaIR: true
        }
      },
    ] 
},
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 8453,
      loggingEnabled: false,
    },
    baseSepolia: {
      url: API_URL_BASESEPOLIA,
      accounts: [PRIVATE_KEY],
      gasPrice: 1000000000 * 10,
    },
    base: {
      url: API_URL_BASE,
      accounts: [PRIVATE_KEY],
    }
  },
   etherscan: {
    apiKey: {
      baseSepolia: BASESCAN_API_KEY,
      base: BASESCAN_API_KEY
    }
  }
}

// npx hardhat verify --network base 0x
// npx hardhat ignition deploy ignition/modules/DragNPuff.js --network base

# Contract Interaction & Deployment Guide

## Quick Start

### Environment Setup
1. Create or update your `.env` file:
```bash
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_api_key
BASE_RPC_URL=https://mainnet.base.org
```

2. Compile contracts:
```bash
npm run compile
```

## Available Commands

### Development (Local Hardhat Node)

**Start local blockchain:**
```bash
npm run dev
```

**Deploy to local hardhat:**
```bash
npm run deploy:local
```

**Execute functions locally:**
```bash
npm run execute:local
```

### Base Mainnet (Production)

**Deploy contracts to Base:**
```bash
npm run deploy
```
- Deploys DragNPuff, FairToken, ERC721Minter, and Airdrop
- Grants MINTER_ROLE to ERC721Minter
- Outputs all contract addresses

**Check contract state:**
```bash
npm run read-state
```
- Displays all contract addresses
- Shows account balance in ETH
- Shows DragNPuff token supply
- Shows FairToken balance

**Interact with contracts:**
```bash
npm run interact
```
- Connects to DragNPuff
- Reads name, symbol, baseURI
- Checks if connected account has MINTER_ROLE or ADMIN_ROLE

**Mint an NFT:**
```bash
npm run mint
```
- Calls safeMint on DragNPuff contract
- Shows transaction hash
- Displays gas usage and new total supply

**Execute custom actions:**
```bash
npm run execute
```
- Example: Mint NFT (can be customized for other functions)
- Shows full transaction details

## Script Details

### `/scripts/deploy-contracts.js`
Deploys all 4 contracts to Base network with proper initialization:
- DragNPuff (ERC721) - NFT collection
- FairToken (ERC20) - Utility token
- ERC721Minter - Minting interface with fees
- Airdrop - Distribution contract

### `/scripts/read-state.js`
Reads state from all deployed contracts:
- ETH balance of connected account
- DragNPuff token supply & balance
- FairToken balance
- Contract addresses

### `/scripts/interact.js`
Connects to DragNPuff and reads metadata:
- Contract name & symbol
- Base URI
- User's roles (MINTER_ROLE, DEFAULT_ADMIN_ROLE)

### `/scripts/mint.js`
Mints a new NFT:
- Calls safeMint() for connected user
- Shows transaction hash & block number
- Displays gas usage

### `/scripts/execute-actions.js`
Template for executing custom contract functions:
- Mint NFT example (ready to use)
- Shows how to call other functions

## Network Configuration

Contracts are deployed on **Base Mainnet** (chainId: 8453):
- **DragNPuff:** 0x5eCbc3931C78169cbF682C9b15602EB8f9A42387
- **FairToken:** 0xC4163b96b1c45e4A8920Cb3Db822b485d9748746
- **ERC721Minter:** 0x1dfA9A1afe793882229111Df790B09155EDF86e0
- **Airdrop:** 0xEBD66a0624e758Ec0FA3268e012Bab33e8247080

## Common Tasks

### Check if deployment was successful:
```bash
npm run read-state
```

### Verify contract on Basescan:
```bash
npx hardhat verify --network base DEPLOYED_CONTRACT_ADDRESS "Constructor Arguments"
```

### Get contract details:
```bash
npm run interact
```

### Mint your first NFT:
```bash
npm run mint
```

## Troubleshooting

**Error: "Invalid private key"**
- Set PRIVATE_KEY in .env file
- Private key should be without 0x prefix

**Error: "Account has insufficient funds"**
- Your account doesn't have enough ETH on Base mainnet
- Visit Base faucet or bridge from Ethereum

**Error: "Contract not found"**
- Verify addresses in `constants/addresses.js` match deployed contracts
- Run `npm run read-state` to check deployed addresses

**Error: "ABI not found"**
- Run `npm run compile` to generate artifacts
- Check that contracts are in `/contracts` folder

## Support

For more information:
- [DragNPuff Documentation](./docs/)
- [Hardhat Docs](https://hardhat.org/)
- [Base Network Docs](https://docs.base.org/)

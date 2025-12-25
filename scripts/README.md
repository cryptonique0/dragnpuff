# DragNPuff Contract Scripts

This directory contains Hardhat scripts for deploying and interacting with DragNPuff smart contracts.

## 📂 Scripts Overview

### Deployment Scripts

#### `deploy-contracts.js`
**Purpose:** Deploy all 4 smart contracts to Base network  
**Usage:** `npm run deploy` (Base) or `npm run deploy:local` (Hardhat)  
**What it does:**
- Deploys DragNPuff (ERC721 NFT contract)
- Deploys FairToken (ERC20 utility token)
- Deploys ERC721Minter (minting interface with fees)
- Deploys Airdrop (token distribution contract)
- Grants MINTER_ROLE to ERC721Minter
- Outputs all contract addresses

**Output Example:**
```
📋 Deployment Summary:
DragNPuff:    0x5eCbc3931C78169cbF682C9b15602EB8f9A42387
FairToken:    0xC4163b96b1c45e4A8920Cb3Db822b485d9748746
ERC721Minter: 0x1dfA9A1afe793882229111Df790B09155EDF86e0
Airdrop:      0xEBD66a0624e758Ec0FA3268e012Bab33e8247080
```

### Contract Interaction Scripts

#### `read-state.js`
**Purpose:** Read current state from all deployed contracts  
**Usage:** `npm run read-state`  
**Displays:**
- Connected account address
- Account ETH balance
- DragNPuff token supply & user balance
- FairToken balance
- All contract addresses

#### `interact.js`
**Purpose:** Connect to DragNPuff and verify connectivity  
**Usage:** `npm run interact`  
**Checks:**
- Contract name & symbol
- Base URI for metadata
- Whether connected account has MINTER_ROLE
- Whether connected account has DEFAULT_ADMIN_ROLE

#### `mint.js`
**Purpose:** Mint a new NFT from DragNPuff contract  
**Usage:** `npm run mint`  
**Actions:**
- Calls `safeMint(address)` on DragNPuff
- Shows transaction hash
- Displays gas used
- Shows new total supply

**Gas Expectations:** ~100,000 - 150,000 gas

#### `execute-actions.js`
**Purpose:** Template for executing custom contract functions  
**Usage:** `npm run execute`  
**Current functionality:** Mints NFT with detailed output  
**To customize:** Edit the main() function to call other contract methods

## 🔑 Environment Setup

### 1. Create `.env` file

Copy from `.env.template`:
```bash
cp .env.template .env
```

Add your private key:
```
PRIVATE_KEY=your_private_key_without_0x_prefix
BASE_RPC_URL=https://mainnet.base.org
```

### 2. Fund your account

For Base mainnet, you need ETH:
- Bridge from Ethereum Mainnet
- Use a Base faucet
- Recommended: 0.1-1.0 ETH to test

### 3. Test deployment locally first

```bash
# Terminal 1: Start local blockchain
npm run dev

# Terminal 2: Deploy to local hardhat
npm run deploy:local
```

## 📊 Command Reference

| Command | Network | Purpose |
|---------|---------|---------|
| `npm run deploy:local` | Hardhat | Deploy to local node |
| `npm run deploy` | Base | Deploy to Base mainnet |
| `npm run read-state` | Base | Check all contract states |
| `npm run interact` | Base | Verify contract connection |
| `npm run mint` | Base | Mint an NFT |
| `npm run execute` | Base | Execute custom functions |
| `npm run execute:local` | Hardhat | Execute functions on local node |

## 🚀 Quick Start

1. **Setup environment:**
   ```bash
   cp .env.template .env
   # Edit .env with your PRIVATE_KEY
   npm install
   npm run compile
   ```

2. **Test locally:**
   ```bash
   # In terminal 1:
   npm run dev
   
   # In terminal 2:
   npm run deploy:local
   ```

3. **Deploy to Base:**
   ```bash
   npm run deploy
   ```

4. **Verify deployment:**
   ```bash
   npm run read-state
   ```

5. **Mint an NFT:**
   ```bash
   npm run mint
   ```

## 🔍 Script Details

### Contract Interactions
All scripts use ethers.js v6 and load contract ABIs from compiled artifacts.

**Common pattern:**
```javascript
const [signer] = await hre.ethers.getSigners();
const contract = new hre.ethers.Contract(ADDRESS, ABI, signer);
const result = await contract.methodName(...args);
```

### Error Handling
Scripts include try-catch blocks with detailed error messages:
- Transaction failures show revert reasons
- Connection issues display RPC errors
- Missing ABI shows artifact compilation errors

## 📝 Adding Custom Functions

To add new contract interactions:

1. Create a new script in this directory
2. Use this template:
   ```javascript
   const hre = require("hardhat");
   const addresses = require("../constants/addresses.js");
   require("dotenv").config();
   
   async function main() {
     const [signer] = await hre.ethers.getSigners();
     const contract = new hre.ethers.Contract(
       addresses.BASE.DRAGNPUFF,
       contractAbi,
       signer
     );
     
     // Your code here
   }
   
   main().catch(error => {
     console.error(error);
     process.exit(1);
   });
   ```

3. Add an npm script to `package.json`:
   ```json
   "your-command": "hardhat run scripts/your-script.js --network base"
   ```

## 🐛 Troubleshooting

### Private Key Issues
```
Error: Invalid private key
```
**Solution:** Ensure PRIVATE_KEY in .env doesn't have "0x" prefix

### Insufficient Funds
```
Error: insufficient funds for gas * price + value
```
**Solution:** Fund your account with ETH on Base network

### Contract Not Found
```
Error: call revert exception
```
**Solution:** 
- Verify address in `constants/addresses.js`
- Run `npm run read-state` to check deployed addresses

### ABI Errors
```
Error: Cannot find artifact
```
**Solution:** Run `npm run compile` to generate artifacts

## 📚 Related Files

- [DEPLOYMENT.md](../DEPLOYMENT.md) - Full deployment guide
- [constants/addresses.js](../constants/addresses.js) - Contract addresses
- [.env.template](../.env.template) - Environment template
- [hardhat.config.js](../hardhat.config.js) - Hardhat configuration

## 🔗 Links

- [Base Network Docs](https://docs.base.org/)
- [Ethers.js Documentation](https://docs.ethers.org/v6/)
- [Hardhat Documentation](https://hardhat.org/)
- [Basescan Explorer](https://basescan.org/)

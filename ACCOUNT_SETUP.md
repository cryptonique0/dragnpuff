# 🔑 Deployment Account Setup Guide

## Quick Setup for New Deployment Account

### Step 1: Get Your Account Ready

You need:
- **Private Key** (from MetaMask, hardware wallet, etc.)
- **ETH on Base Network** (for gas fees - recommend 0.5-1.0 ETH)

### Step 2: Create Your .env File

```bash
# Copy the template
cp .env.template .env
```

### Step 3: Edit .env with Your Account Details

Open `.env` and update:

```bash
# Your account's private key (WITHOUT the 0x prefix)
PRIVATE_KEY=your_private_key_here

# Base network RPC
BASE_RPC_URL=https://mainnet.base.org

# Optional: Basescan API key for contract verification
BASESCAN_API_KEY=your_basescan_api_key
```

**⚠️ IMPORTANT:**
- Remove `0x` from the start of your private key
- NEVER commit .env to git
- Keep your private key secure

### Step 4: Fund Your Account

Your deployment account needs ETH on Base network:

**Option 1: Bridge from Ethereum**
- Visit https://bridge.base.org
- Connect your wallet
- Bridge ETH to Base

**Option 2: Buy on Base**
- Use a centralized exchange that supports Base
- Withdraw directly to Base network

**How much ETH?**
- Deployment costs ~1.5-2.0 ETH in gas (varies)
- Recommend having 0.5-1.0 ETH for testing

### Step 5: Verify Setup

```bash
# Compile contracts
npm run compile

# Check your account (will show address and balance)
npm run read-state
```

This will display:
- Your account address
- ETH balance on Base
- Whether you have enough gas

### Step 6: Deploy!

```bash
# Deploy all 4 contracts to Base mainnet
npm run deploy
```

## Troubleshooting

### "Invalid private key"
- Make sure you removed `0x` from the start
- Check for extra spaces or quotes

### "Insufficient funds"
- Your account doesn't have enough ETH on Base
- Bridge more ETH to Base network

### "Wrong network"
- Make sure BASE_RPC_URL is: `https://mainnet.base.org`

## What Gets Deployed

Running `npm run deploy` will:
1. ✅ Deploy DragNPuff (ERC721 NFT)
2. ✅ Deploy FairToken (ERC20 Token)
3. ✅ Deploy ERC721Minter (Minting interface)
4. ✅ Deploy Airdrop (Distribution contract)
5. ✅ Grant MINTER_ROLE to ERC721Minter
6. ✅ Display all contract addresses

## After Deployment

1. **Save the contract addresses** - They'll be displayed in the terminal
2. **Update constants/addresses.js** if needed
3. **Verify on Basescan:**
   ```bash
   npx hardhat verify --network base CONTRACT_ADDRESS "Constructor Args"
   ```

## Security Checklist

- [ ] Private key is in .env file
- [ ] .env is in .gitignore (already done)
- [ ] Never share your private key
- [ ] Keep .env backed up securely (encrypted)
- [ ] Account has sufficient ETH on Base

## Ready?

```bash
# 1. Setup environment
cp .env.template .env
# Edit .env with your private key

# 2. Compile
npm run compile

# 3. Check account
npm run read-state

# 4. Deploy
npm run deploy
```

## Need Help?

- Check your account on Basescan: https://basescan.org/address/YOUR_ADDRESS
- Test locally first: `npm run dev` then `npm run deploy:local`
- See full guide: [DEPLOYMENT.md](./DEPLOYMENT.md)

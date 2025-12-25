# 🚀 Quick Start Guide - DragNPuff Contract Deployment

## 5-Minute Setup

### Step 1: Configure Environment
```bash
# Copy template to .env
cp .env.template .env

# Edit .env and add your private key
# PRIVATE_KEY=your_key_here
```

### Step 2: Compile Contracts
```bash
npm run compile
```

### Step 3: Deploy to Base Mainnet
```bash
npm run deploy
```

This will:
- ✅ Deploy DragNPuff (ERC721)
- ✅ Deploy FairToken (ERC20)
- ✅ Deploy ERC721Minter
- ✅ Deploy Airdrop contract
- ✅ Set up permissions

### Step 4: Verify Deployment
```bash
npm run read-state
```

Shows:
- Account balance
- Contract addresses
- Token supplies

### Step 5: Mint Your First NFT
```bash
npm run mint
```

## 📋 Available Commands

### Mainnet (Base)
```bash
npm run deploy        # Deploy all contracts
npm run read-state    # Check contract states
npm run interact      # Verify connection
npm run mint          # Mint an NFT
npm run execute       # Execute custom functions
```

### Local Development
```bash
npm run dev              # Start local blockchain
npm run deploy:local     # Deploy to local hardhat
npm run execute:local    # Run functions locally
```

### Utilities
```bash
npm run compile  # Compile contracts
npm run test     # Run tests
npm run lint     # Check code quality
npm run format   # Format code
```

## ⚙️ Configuration

### Required (.env)
```
PRIVATE_KEY=your_private_key_here
BASE_RPC_URL=https://mainnet.base.org
```

### Optional (.env)
```
BASESCAN_API_KEY=for_contract_verification
LOG_LEVEL=info
VERBOSE=false
```

## 🔄 Workflow

### For Fresh Deployment:
```bash
# 1. Setup
cp .env.template .env
# Edit .env with your key

# 2. Compile
npm run compile

# 3. Deploy
npm run deploy

# 4. Verify
npm run read-state

# 5. Mint test NFT
npm run mint
```

### For Local Testing:
```bash
# Terminal 1: Start blockchain
npm run dev

# Terminal 2: Deploy locally
npm run deploy:local

# Terminal 3: Interact
npm run execute:local
```

## 💡 Tips

1. **Fund Your Account**
   - Need ETH on Base network
   - Bridge from Ethereum or use faucet

2. **Test Locally First**
   - Always deploy to local hardhat before mainnet
   - No gas fees for testing

3. **Save Addresses**
   - Note the deployed contract addresses
   - Add to constants/addresses.js if custom

4. **Monitor Gas**
   - Scripts show gas usage
   - Deployment typically costs ~1.5-2.0 ETH in gas

5. **Error Handling**
   - Check .env file if "Invalid private key" error
   - Fund account if "insufficient funds" error
   - Run compile if "ABI not found" error

## 📚 Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment guide
- [scripts/README.md](./scripts/README.md) - Script documentation
- [.env.template](./.env.template) - Environment variables

## 🌐 Contract Addresses (Base Mainnet)

| Contract | Address |
|----------|---------|
| DragNPuff | 0x5eCbc3931C78169cbF682C9b15602EB8f9A42387 |
| FairToken | 0xC4163b96b1c45e4A8920Cb3Db822b485d9748746 |
| ERC721Minter | 0x1dfA9A1afe793882229111Df790B09155EDF86e0 |
| Airdrop | 0xEBD66a0624e758Ec0FA3268e012Bab33e8247080 |

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| `Invalid private key` | Remove "0x" from start of key in .env |
| `Insufficient funds` | Fund account with ETH on Base network |
| `Contract not found` | Run `npm run compile` first |
| `ABI not found` | Ensure contracts are in /contracts folder |
| `Connection refused` | Check BASE_RPC_URL in .env |

## 🎯 Next Steps

1. Deploy contracts: `npm run deploy`
2. Verify: `npm run read-state`
3. Test minting: `npm run mint`
4. View on [Basescan](https://basescan.org/)

## 📞 Support

- See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guide
- Check [scripts/README.md](./scripts/README.md) for script details
- Review [docs/](./docs/) for architecture and API docs

---

**Ready to deploy?** Run: `npm run deploy` 🚀

# 🔒 Secure Deployment Workflow

## Deploy Locally, Update Contract Addresses

This is the **recommended approach** for security - deploy from your secure local environment, then update the contract addresses in the repository.

## Step 1: Deploy from Your Local Machine

### On Your Local Computer:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/markcarey/dragnpuff.git
   cd dragnpuff
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create .env file (stays on your machine only):**
   ```bash
   cp .env.template .env
   nano .env  # Add your PRIVATE_KEY
   ```

4. **Compile contracts:**
   ```bash
   npm run compile
   ```

5. **Deploy to Base:**
   ```bash
   npm run deploy
   ```

6. **Save the contract addresses** that are displayed!

## Step 2: Update Contract Addresses in Repository

After deployment, you'll receive output like:
```
📋 Deployment Summary:
DragNPuff:    0xABCDEF1234567890...
FairToken:    0x1234567890ABCDEF...
ERC721Minter: 0xFEDCBA0987654321...
Airdrop:      0x0987654321FEDCBA...
```

### Update These Files:

**1. Edit `constants/addresses.js`:**
```javascript
const addresses = {
  BASE: {
    DRAGNPUFF: "0xYOUR_DRAGNPUFF_ADDRESS",
    MINTER: "0xYOUR_MINTER_ADDRESS",
    FAIR_TOKEN: "0xYOUR_FAIRTOKEN_ADDRESS",
    AIRDROP: "0xYOUR_AIRDROP_ADDRESS"
  }
};
```

**2. Edit `.env.example`:**
```bash
VITE_DRAGN_CONTRACT=0xYOUR_DRAGNPUFF_ADDRESS
VITE_MINTER_ADDRESS=0xYOUR_MINTER_ADDRESS
VITE_FAIR_TOKEN_ADDRESS=0xYOUR_FAIRTOKEN_ADDRESS
VITE_AIRDROP_ADDRESS=0xYOUR_AIRDROP_ADDRESS
```

**3. Update documentation (optional):**
- README.md
- DEPLOYMENT.md
- Any other docs with hardcoded addresses

## Step 3: Commit and Push

```bash
git add constants/addresses.js .env.example
git commit -m "update: deployed contract addresses on Base mainnet

- DragNPuff: 0xYOUR_ADDRESS
- FairToken: 0xYOUR_ADDRESS
- ERC721Minter: 0xYOUR_ADDRESS
- Airdrop: 0xYOUR_ADDRESS"

git push origin main
```

## Alternative: Use a Burner Account

If you prefer deploying in this codespace:

1. **Create a new wallet** specifically for deployment
2. **Fund it with just enough ETH** for deployment (~1-2 ETH)
3. **Use that private key** in .env
4. **After deployment, transfer any remaining funds** out
5. **Discard the wallet**

## What's Safe to Commit?

✅ **Safe to commit:**
- Contract addresses
- .env.example (template without real keys)
- constants/addresses.js
- All scripts and documentation
- Compiled contract artifacts

❌ **NEVER commit:**
- .env file (contains your private key)
- Any file with private keys
- Wallet seed phrases
- API keys for paid services

## Quick Reference

### Files to Update After Deployment:

| File | Purpose |
|------|---------|
| `constants/addresses.js` | Main contract address configuration |
| `.env.example` | Template for environment variables |
| `README.md` | Update contract links (optional) |
| `DEPLOYMENT.md` | Update example addresses (optional) |

### Command to Update Addresses:

```bash
# Find all files with old addresses
grep -r "0x5eCbc3931C78169cbF682C9b15602EB8f9A42387" .

# Replace with your new address
# (Do this manually in each file)
```

## Verification

After updating addresses, verify:

```bash
# Check the addresses are correct
cat constants/addresses.js

# Check .env.example has new addresses
cat .env.example

# Make sure .env is NOT staged for commit
git status | grep .env
# Should show: .env (in .gitignore)
```

## Need Help?

If you deploy locally and need help updating the addresses, just provide:
- DragNPuff address
- FairToken address  
- ERC721Minter address
- Airdrop address

And I can help update all the necessary files!

---

**Remember:** Your `.env` file with the private key should **NEVER** leave your local machine or be committed to git. It's already in `.gitignore` to prevent accidents.

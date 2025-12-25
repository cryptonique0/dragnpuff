# Mint NFT Guide

## Quick Start

Mint your first DragN'Puff NFT in under 5 minutes!

## Prerequisites

1. **MetaMask wallet** with Base network added
2. **0.01+ ETH** on Base for minting + gas
3. **git clone** the repository

## Step 1: Setup

```bash
cd dragnpuff
npm install
cp .env.template .env
```

Edit `.env`:
```bash
PRIVATE_KEY=0xyour_private_key_with_0x
BASE_RPC_URL=https://mainnet.base.org
```

## Step 2: Compile Contracts

```bash
npm run compile
```

## Step 3: Check Mint Fee

```bash
npm run read-state
```

Look for:
```
Public Mint Fee:  0.002 ETH
Holder Mint Fee:  0.001 ETH
```

## Step 4: Mint NFT

### Using Script

```bash
npm run mint
```

### Using Hardhat Console

```bash
npx hardhat console --network base
```

```javascript
// Load contracts
const minter = await ethers.getContractAt("ERC721Minter", "0x1dfA9A1afe793882229111Df790B09155EDF86e0");
const dragnpuff = await ethers.getContractAt("DragNPuff", "0x5eCbc3931C78169cbF682C9b15602EB8f9A42387");

// Mint NFT
const fee = ethers.parseEther("0.002");
const tx = await minter.mint(
  "0xyouraddress", 
  "ipfs://your-metadata-uri",
  { value: fee }
);

const receipt = await tx.wait();
console.log("Minted:", receipt.transactionHash);

// Check balance
const balance = await dragnpuff.balanceOf("0xyouraddress");
console.log("Your NFTs:", balance.toString());
```

## Step 5: View Your NFT

1. Go to [BaseScan](https://basescan.org)
2. Search for DragNPuff address
3. Find your transaction
4. View token in your wallet

## Troubleshooting

### Insufficient funds
- Bridge ETH from Ethereum using [Base Bridge](https://bridge.base.org)
- Need: 0.002 ETH (mint fee) + ~0.001 ETH (gas)

### Transaction reverted
- Check you're on Base network
- Verify fee amount matches current setting
- Ensure private key is valid

### MetaMask error
- Add Base network:
  - Network Name: Base
  - RPC: https://mainnet.base.org
  - Chain ID: 8453
  - Currency: ETH

## Cost Summary

| Item | Cost |
|------|------|
| Public Mint | 0.002 ETH |
| Gas (typical) | ~0.0008 ETH |
| **Total** | **~0.003 ETH** |

## Next Steps

- [View your NFTs](./VIEW_NFTs.md)
- [Trade NFTs](./TRADING.md)
- [Stake tokens](./STAKING.md)

## Advanced Minting

### Batch Mint

```javascript
for (let i = 0; i < 5; i++) {
  const tx = await minter.mint("0xyou", `ipfs://uri${i}`, {value: fee});
  await tx.wait();
  console.log(`Minted NFT #${i+1}`);
}
```

### With Custom Metadata

```javascript
// Create metadata JSON
const metadata = {
  name: "DragN #1",
  description: "My custom DragN",
  image: "ipfs://...",
  attributes: [
    { trait_type: "Rarity", value: "Rare" }
  ]
};

// Upload to IPFS and mint
const ipfsHash = await uploadToIPFS(metadata);
await minter.mint("0xyou", ipfsHash, {value: fee});
```

## Support

- **Questions?** Check [FAQ](../docs/FAQ.md)
- **Issues?** See [Troubleshooting](../docs/TROUBLESHOOTING.md)
- **Code help?** Review [API Reference](../docs/API_REFERENCE.md)

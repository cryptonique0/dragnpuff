# NFT Trading Guide

## Overview

Trade your DragN'Puff NFTs with other users.

## Prerequisites

- Own at least one DragNPuff NFT
- Have 0.001+ ETH for gas
- Connected to Base network

## Trading Methods

### Method 1: Direct Transfer

```javascript
const dragnpuff = await ethers.getContractAt("DragNPuff", DRAGN_ADDRESS);

// Transfer to another address
const tx = await dragnpuff.transferFrom(
  yourAddress,
  buyerAddress,
  tokenId
);

await tx.wait();
console.log("✅ NFT transferred");
```

### Method 2: Safe Transfer

```javascript
const tx = await dragnpuff.safeTransferFrom(
  yourAddress,
  buyerAddress,
  tokenId,
  "0x" // Additional data
);

await tx.wait();
```

## Marketplace Integration

List NFT on marketplace:

```javascript
// Approve marketplace
await dragnpuff.approve(MARKETPLACE_ADDRESS, tokenId);

// List for sale
const marketplace = await ethers.getContractAt("Marketplace", MARKETPLACE_ADDRESS);
const priceInEth = "1.5";

const tx = await marketplace.listNFT(
  tokenId,
  ethers.parseEther(priceInEth)
);

await tx.wait();
console.log("📋 NFT listed for 1.5 ETH");
```

## Checking NFT Value

```javascript
// Get floor price
const floorPrice = await marketplace.getFloorPrice();
console.log(`Floor: ${ethers.formatEther(floorPrice)} ETH`);

// Get average sale price
const avgPrice = await marketplace.getAveragePrice();
console.log(`Average: ${ethers.formatEther(avgPrice)} ETH`);

// Get your NFT listing
const listing = await marketplace.getListing(tokenId);
console.log(`Listed at: ${ethers.formatEther(listing.price)} ETH`);
```

## Bidding on NFTs

```javascript
const marketplace = await ethers.getContractAt("Marketplace", MARKETPLACE_ADDRESS);

// Make bid
const bidAmount = ethers.parseEther("0.5");
const tx = await marketplace.placeBid(tokenId, bidAmount, {
  value: bidAmount
});

await tx.wait();
console.log("✅ Bid placed");

// Accept bid
await marketplace.acceptBid(tokenId, bidderAddress);
```

## Transaction History

```javascript
// Get all transfers for your address
const filter = dragnpuff.filters.Transfer(yourAddress, null);
const transfers = await dragnpuff.queryFilter(filter);

console.log(`You've sent ${transfers.length} NFTs`);

transfers.forEach(t => {
  console.log(`- Token #${t.args.tokenId} to ${t.args.to}`);
});
```

## Gas Costs

| Action | Gas Cost |
|--------|----------|
| Transfer | ~65,000 |
| Safe Transfer | ~85,000 |
| Approve | ~45,000 |
| List (Marketplace) | ~100,000 |
| Place Bid | ~120,000 |

## Safety Tips

- ✅ Always verify buyer/seller address
- ✅ Check token ID before transfer
- ✅ Approve only necessary amount
- ✅ Use safe transfer when possible
- ✅ Keep private key secure
- ❌ Never send first without verification
- ❌ Don't transfer to unknown contracts
- ❌ Avoid public/air-gapped trades

## Bulk Trading

```javascript
async function bulkTransfer(recipients, tokenIds) {
  for (let i = 0; i < recipients.length; i++) {
    const tx = await dragnpuff.transferFrom(
      yourAddress,
      recipients[i],
      tokenIds[i]
    );
    await tx.wait();
    console.log(`Transferred token #${tokenIds[i]}`);
  }
}

const recipients = ["0xaddr1", "0xaddr2", "0xaddr3"];
const tokenIds = [1, 2, 3];
await bulkTransfer(recipients, tokenIds);
```

## View Your Collection

```bash
npm run read-state
```

Shows:
- NFT balance
- All owned token IDs
- Metadata URIs
- Last transfer date

## Rarity & Valuation

```javascript
// Get token metadata
const uri = await dragnpuff.tokenURI(tokenId);
const metadata = await fetch(uri).then(r => r.json());

console.log("Name:", metadata.name);
console.log("Rarity:", metadata.attributes[0]);

// Estimate value based on traits
const value = estimateValue(metadata.attributes);
console.log("Est. Value:", value, "ETH");
```

## Common Issues

**Q: "ERC721: transfer of token that is not own"**
A: You don't own this token. Check token ID.

**Q: "ERC721: approval to current owner"**
A: Already approved. Proceed with transfer.

**Q: Transaction pending forever**
A: RPC issue. Check Base network status.

## See Also

- [NFT Viewing Guide](./VIEW_NFTs.md)
- [Minting Guide](./MINT_NFT.md)
- [Marketplace](./MARKETPLACE.md)

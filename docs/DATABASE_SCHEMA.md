/**
 * Database Schema Guide
 * Defines data structure for all platform entities
 */

# Database Schema Documentation

## Users Collection

```javascript
{
  _id: ObjectId,
  address: String (unique, lowercase),
  username: String (unique),
  email: String,
  bio: String,
  avatar: String (URL),
  verified: Boolean,
  nonce: String,
  lastLogin: Date,
  followers: [String] (addresses),
  following: [String] (addresses),
  preferences: {
    notifications: Boolean,
    newsletter: Boolean,
    theme: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

## NFTs Collection

```javascript
{
  _id: ObjectId,
  tokenId: String (unique),
  contractAddress: String,
  owner: String (address),
  creator: String (address),
  name: String,
  description: String,
  image: String (IPFS URL),
  attributes: [
    {
      trait_type: String,
      value: String
    }
  ],
  rarity: String (common, uncommon, rare, epic, legendary),
  metadata: Object,
  listed: Boolean,
  price: Number,
  listingId: String,
  likes: [String] (user addresses),
  mintedAt: Date,
  updatedAt: Date
}
```

## Listings Collection

```javascript
{
  _id: ObjectId,
  listingId: String (unique),
  nftId: String,
  seller: String (address),
  price: Number,
  currency: String (ETH, FAIR, etc),
  status: String (active, sold, cancelled),
  bids: [
    {
      bidder: String,
      amount: Number,
      timestamp: Date
    }
  ],
  offers: [
    {
      offerer: String,
      amount: Number,
      status: String,
      timestamp: Date
    }
  ],
  highestBid: {
    bidder: String,
    amount: Number,
    timestamp: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Staking Positions Collection

```javascript
{
  _id: ObjectId,
  userId: String (address),
  amount: Number,
  lockedUntil: Date,
  apy: Number,
  rewardsEarned: Number,
  pendingRewards: Number,
  tier: String (bronze, silver, gold, platinum),
  stakedAt: Date,
  lastClaimAt: Date,
  updatedAt: Date
}
```

## Governance Proposals Collection

```javascript
{
  _id: ObjectId,
  proposalId: String (unique),
  creator: String (address),
  title: String,
  description: String,
  target: String (address),
  value: String,
  status: String (pending, active, succeeded, executed, failed),
  forVotes: Number,
  againstVotes: Number,
  abstainVotes: Number,
  votes: [
    {
      voter: String,
      vote: String (for, against, abstain),
      timestamp: Date
    }
  ],
  startBlock: Number,
  endBlock: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Transactions Collection

```javascript
{
  _id: ObjectId,
  txHash: String (unique),
  from: String (address),
  to: String (address),
  type: String (transfer, mint, burn, stake, claim, vote, etc),
  amount: Number,
  value: Number,
  status: String (pending, confirmed, failed),
  blockNumber: Number,
  timestamp: Date,
  contractAddress: String,
  chainId: Number,
  gasUsed: Number,
  gasPrice: Number
}
```

## Activity Log Collection

```javascript
{
  _id: ObjectId,
  user: String (address),
  action: String,
  target: String (NFT ID, Proposal ID, etc),
  metadata: Object,
  ipAddress: String,
  userAgent: String,
  timestamp: Date
}
```

## Indexes

### Users
- `address` (unique)
- `username` (unique)
- `email`
- `createdAt`

### NFTs
- `tokenId` (unique)
- `contractAddress`
- `owner`
- `creator`
- `listed`

### Listings
- `listingId` (unique)
- `seller`
- `nftId`
- `status`
- `createdAt`

### Staking Positions
- `userId` (unique)
- `amount`
- `tier`

### Governance Proposals
- `proposalId` (unique)
- `creator`
- `status`
- `createdAt`

### Transactions
- `txHash` (unique)
- `from`
- `to`
- `type`
- `timestamp`

### Activity Log
- `user`
- `action`
- `timestamp`

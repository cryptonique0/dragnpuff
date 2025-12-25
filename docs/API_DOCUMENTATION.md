/**
 * API Documentation
 * Complete API reference for all endpoints
 */

# DragNPuff API Documentation

## Base URL
```
https://api.dragnpuff.io/api
```

## Authentication
All endpoints that require authentication use Bearer tokens in the Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

## Response Format
All responses follow this format:
```json
{
  "success": true/false,
  "data": {},
  "message": "string",
  "statusCode": 200
}
```

## NFT Endpoints

### Get NFT Details
```
GET /nft/:tokenId
```
Returns metadata and ownership information for an NFT.

### Get User NFTs
```
GET /nft/user/:address
```
Returns all NFTs owned by an address with pagination.

### Mint NFT
```
POST /nft/mint
Content-Type: application/json
Authorization: Bearer <token>

{
  "to": "0x...",
  "tokenUri": "ipfs://...",
  "data": {}
}
```

### Transfer NFT
```
POST /nft/transfer/:tokenId
Authorization: Bearer <token>

{
  "to": "0x..."
}
```

### Burn NFT
```
POST /nft/burn/:tokenId
Authorization: Bearer <token>
```

## Marketplace Endpoints

### Get All Listings
```
GET /marketplace/listings?page=1&limit=20&sort=newest
```

### Create Listing
```
POST /marketplace/listings
Authorization: Bearer <token>

{
  "nftId": "1",
  "price": 2.5,
  "currency": "ETH"
}
```

### Buy NFT
```
POST /marketplace/buy/:listingId
Authorization: Bearer <token>
```

### Place Bid
```
POST /marketplace/bid/:listingId
Authorization: Bearer <token>

{
  "amount": 2.5
}
```

### Get Floor Price
```
GET /marketplace/floor-price
```

### Get Trading Volume
```
GET /marketplace/volume
```

## Staking Endpoints

### Get Staking Info
```
GET /staking/info
```

### Get User Staking Position
```
GET /staking/user/:address
Authorization: Bearer <token>
```

### Get Pending Rewards
```
GET /staking/rewards/:address
Authorization: Bearer <token>
```

### Stake Tokens
```
POST /staking/stake
Authorization: Bearer <token>

{
  "amount": 1000,
  "lockPeriod": 30
}
```

### Claim Rewards
```
POST /staking/claim
Authorization: Bearer <token>
```

### Get APY for Amount
```
GET /staking/rate?amount=5000
```

### Get Leaderboard
```
GET /staking/leaderboard?page=1&limit=50
```

## Token Endpoints

### Get Balance
```
GET /token/balance/:address
```

### Get Total Supply
```
GET /token/supply
```

### Transfer Tokens
```
POST /token/transfer
Authorization: Bearer <token>

{
  "to": "0x...",
  "amount": 1000
}
```

### Approve Spending
```
POST /token/approve
Authorization: Bearer <token>

{
  "spender": "0x...",
  "amount": 5000
}
```

### Get Allowance
```
GET /token/allowance/:owner/:spender
```

### Get Token Info
```
GET /token/info
```

## Governance Endpoints

### Get All Proposals
```
GET /governance/proposals
```

### Get Proposal Details
```
GET /governance/proposals/:proposalId
```

### Create Proposal
```
POST /governance/proposals
Authorization: Bearer <token>

{
  "title": "Proposal Title",
  "description": "Description",
  "target": "0x...",
  "value": "0"
}
```

### Vote on Proposal
```
POST /governance/vote/:proposalId
Authorization: Bearer <token>

{
  "vote": "for" | "against" | "abstain"
}
```

### Get Voting Power
```
GET /governance/voting-power/:address
```

### Get Proposal State
```
GET /governance/proposals/:proposalId/state
```

## User Endpoints

### Get Profile
```
GET /user/:address
```

### Update Profile
```
PUT /user/:address
Authorization: Bearer <token>

{
  "username": "string",
  "bio": "string",
  "avatar": "string"
}
```

### Get Portfolio
```
GET /user/:address/portfolio
```

### Get Transaction History
```
GET /user/:address/transactions
```

### Get User Stats
```
GET /user/:address/stats
```

## Error Codes

| Code | Meaning |
|------|---------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request |
| 401  | Unauthorized |
| 403  | Forbidden |
| 404  | Not Found |
| 500  | Server Error |

## Rate Limiting

API requests are rate limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

Limit information is included in response headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Time when limit resets

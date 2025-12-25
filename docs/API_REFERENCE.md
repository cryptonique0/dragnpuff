# API Documentation

## Overview

Complete API reference for DragNPuff smart contracts and backend services.

## Base Configuration

- **Network:** Base (Chainid: 8453)
- **RPC URL:** https://mainnet.base.org
- **Explorer:** https://basescan.org

## Smart Contract APIs

### DragNPuff (ERC721)

#### Events

```solidity
event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)
event ApprovalForAll(address indexed owner, address indexed operator, bool approved)
event Burn(uint256 tokenId)
```

#### Functions

##### balanceOf
```solidity
function balanceOf(address owner) external view returns (uint256)
```
Get NFT count for address.

**Response:**
```json
{
  "count": "5"
}
```

##### ownerOf
```solidity
function ownerOf(uint256 tokenId) external view returns (address)
```
Get owner of token ID.

**Response:**
```json
{
  "owner": "0x..."
}
```

##### tokenURI
```solidity
function tokenURI(uint256 tokenId) external view returns (string)
```
Get metadata URI for token.

**Response:**
```json
{
  "uri": "ipfs://..."
}
```

##### mint
```solidity
function mint(address to, string memory uri) external
```
Mint new NFT.

**Parameters:**
- `to`: Address to mint to
- `uri`: Metadata URI

**Response:**
```json
{
  "transactionHash": "0x...",
  "tokenId": "1"
}
```

### FairToken (ERC20)

#### Events

```solidity
event Transfer(address indexed from, address indexed to, uint256 value)
event Approval(address indexed owner, address indexed spender, uint256 value)
```

#### Functions

##### balanceOf
```solidity
function balanceOf(address account) external view returns (uint256)
```
Get token balance.

**Response:**
```json
{
  "balance": "1000000000000000000"
}
```

##### transfer
```solidity
function transfer(address to, uint256 amount) external returns (bool)
```
Transfer tokens.

**Parameters:**
- `to`: Recipient address
- `amount`: Amount in wei

**Response:**
```json
{
  "success": true,
  "transactionHash": "0x..."
}
```

##### approve
```solidity
function approve(address spender, uint256 amount) external returns (bool)
```
Approve spending.

**Parameters:**
- `spender`: Spender address
- `amount`: Amount in wei

**Response:**
```json
{
  "success": true,
  "transactionHash": "0x..."
}
```

## REST API Endpoints

### Health Check

```bash
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-25T12:00:00Z"
}
```

### Contracts

```bash
GET /api/contracts
```

**Response:**
```json
{
  "dragnpuff": "0x5eCbc3931C78169cbF682C9b15602EB8f9A42387",
  "fairToken": "0xC4163b96b1c45e4A8920Cb3Db822b485d9748746",
  "minter": "0x1dfA9A1afe793882229111Df790B09155EDF86e0",
  "airdrop": "0xEBD66a0624e758Ec0FA3268e012Bab33e8247080"
}
```

### Get NFT Metadata

```bash
GET /api/nft/:tokenId
```

**Response:**
```json
{
  "tokenId": "1",
  "name": "DragN #1",
  "description": "Collectible NFT",
  "image": "ipfs://...",
  "attributes": [
    {
      "trait_type": "Rarity",
      "value": "Rare"
    }
  ]
}
```

### Get User NFTs

```bash
GET /api/user/:address/nfts
```

**Response:**
```json
{
  "address": "0x...",
  "nfts": [
    {
      "tokenId": "1",
      "name": "DragN #1",
      "image": "ipfs://..."
    }
  ],
  "count": 5
}
```

### Mint NFT

```bash
POST /api/mint
Content-Type: application/json

{
  "to": "0x...",
  "uri": "ipfs://...",
  "fee": "1000000000000000000"
}
```

**Response:**
```json
{
  "success": true,
  "transactionHash": "0x...",
  "tokenId": "1"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid request"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "statusCode": 500,
  "message": "Internal server error"
}
```

## Rate Limiting

- **Rate Limit:** 100 requests per minute
- **Rate Limit Window:** 1 minute
- **Header:** `X-RateLimit-Remaining`

## Authentication

Some endpoints require authentication:

```bash
Authorization: Bearer <token>
```

## Pagination

List endpoints support pagination:

```bash
GET /api/nfts?page=1&limit=20
```

**Response:**
```json
{
  "items": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Webhooks

Subscribe to events:

```bash
POST /api/webhooks
Content-Type: application/json

{
  "url": "https://example.com/webhook",
  "events": ["transfer", "mint", "burn"]
}
```

## Examples

### Using cURL

```bash
# Get contract addresses
curl -X GET https://api.dragnpuff.xyz/api/contracts

# Get user NFTs
curl -X GET https://api.dragnpuff.xyz/api/user/0x.../nfts

# Mint NFT
curl -X POST https://api.dragnpuff.xyz/api/mint \
  -H "Content-Type: application/json" \
  -d '{
    "to": "0x...",
    "uri": "ipfs://...",
    "fee": "1000000000000000000"
  }'
```

### Using JavaScript

```javascript
const response = await fetch('https://api.dragnpuff.xyz/api/contracts');
const contracts = await response.json();
console.log(contracts);
```

## See Also

- [Contract ABI Documentation](./CONTRACTS.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [Deployment Guide](./DEPLOYMENT.md)

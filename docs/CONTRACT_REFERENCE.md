# Contract Reference Guide

## Overview

Complete reference for all DragNPuff smart contracts.

## DragNPuff.sol (ERC721)

### Purpose
Main NFT contract for DragN'Puff collectibles.

### Address
**Base:** `0x5eCbc3931C78169cbF682C9b15602EB8f9A42387`

### Key Features
- ERC721 standard implementation
- Metadata URI support
- Token burn functionality
- Safe transfers with callback support

### Events

```solidity
event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
```

### Main Functions

#### balanceOf
```solidity
function balanceOf(address owner) external view returns (uint256)
```
Get number of NFTs owned by address.

#### ownerOf
```solidity
function ownerOf(uint256 tokenId) external view returns (address)
```
Get owner of specific NFT.

#### tokenURI
```solidity
function tokenURI(uint256 tokenId) external view returns (string)
```
Get metadata URI for NFT.

#### mint
```solidity
function mint(address to, string memory uri) external
```
Mint new NFT (restricted to MINTER_ROLE).

#### burn
```solidity
function burn(uint256 tokenId) external
```
Destroy NFT permanently.

#### safeMint
```solidity
function safeMint(address to, string memory uri) external
```
Mint with safety checks.

---

## FairToken.sol (ERC20)

### Purpose
In-game token for rewards and transfers.

### Address
**Base:** `0xC4163b96b1c45e4A8920Cb3Db822b485d9748746`

### Key Features
- ERC20 standard implementation
- Burnable tokens
- Pausable transfer support
- Role-based access control

### Events

```solidity
event Transfer(address indexed from, address indexed to, uint256 value);
event Approval(address indexed owner, address indexed spender, uint256 value);
event Burn(address indexed burner, uint256 value);
```

### Main Functions

#### transfer
```solidity
function transfer(address to, uint256 amount) external returns (bool)
```
Transfer tokens to another address.

#### transferFrom
```solidity
function transferFrom(address from, address to, uint256 amount) external returns (bool)
```
Transfer tokens on behalf of another address.

#### approve
```solidity
function approve(address spender, uint256 amount) external returns (bool)
```
Allow spender to use tokens.

#### balanceOf
```solidity
function balanceOf(address account) external view returns (uint256)
```
Get token balance of address.

#### totalSupply
```solidity
function totalSupply() external view returns (uint256)
```
Get total token supply.

#### burn
```solidity
function burn(uint256 amount) external
```
Permanently destroy tokens.

---

## ERC721Minter.sol

### Purpose
Dedicated contract for minting NFTs with fee management.

### Address
**Base:** `0x1dfA9A1afe793882229111Df790B09155EDF86e0`

### Key Features
- Controlled NFT minting
- Fee collection (dual-tier: holder/public)
- Revenue management
- Role-based access control

### Events

```solidity
event Mint(address indexed to, uint256 indexed tokenId, uint256 fee);
event FeeUpdated(uint256 newPublicFee, uint256 newHolderFee);
event FeeWithdrawn(address indexed recipient, uint256 amount);
```

### Main Functions

#### mint
```solidity
function mint(address to, string memory uri) external payable
```
Mint NFT, paying applicable fee.

#### setPublicFee
```solidity
function setPublicFee(uint256 newFee) external
```
Update public minting fee (admin only).

#### setHolderFee
```solidity
function setHolderFee(uint256 newFee) external
```
Update holder minting fee (admin only).

#### withdrawFees
```solidity
function withdrawFees(address payable recipient) external
```
Withdraw accumulated fees.

#### publicMintFee
```solidity
function publicMintFee() external view returns (uint256)
```
Get current public minting fee.

#### holderMintFee
```solidity
function holderMintFee() external view returns (uint256)
```
Get current holder minting fee.

---

## Airdrop.sol

### Purpose
Distribute tokens to eligible addresses.

### Address
**Base:** `0xEBD66a0624e758Ec0FA3268e012Bab33e8247080`

### Key Features
- Whitelisted airdrop distribution
- Claim tracking
- Multiple distribution rounds
- Owner management

### Events

```solidity
event Claimed(address indexed account, uint256 amount);
event WhitelistUpdated(address[] addresses, bool[] status);
event AirdropCreated(uint256 round, uint256 amount);
```

### Main Functions

#### claim
```solidity
function claim() external
```
Claim airdropped tokens (one-time).

#### setClaimed
```solidity
function setClaimed(address account, bool status) external
```
Mark address as claimed/unclaimed (admin).

#### addWhitelist
```solidity
function addWhitelist(address[] memory addresses) external
```
Add addresses to whitelist (admin).

#### removeWhitelist
```solidity
function removeWhitelist(address[] memory addresses) external
```
Remove addresses from whitelist (admin).

#### claimed
```solidity
function claimed(address account) external view returns (bool)
```
Check if address has claimed.

#### isWhitelisted
```solidity
function isWhitelisted(address account) external view returns (bool)
```
Check if address is whitelisted.

---

## Roles

### MINTER_ROLE
Allows contract to call mint functions on NFT contract.

```solidity
bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
```

### DEFAULT_ADMIN_ROLE
Full administrative access.

```solidity
bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;
```

---

## Gas Estimates

### Minting
- Mint: ~150,000 gas
- Safe Mint: ~175,000 gas
- Batch Mint: ~150,000 per item

### Transfers
- Transfer: ~60,000 gas
- Safe Transfer From: ~80,000 gas
- Approve: ~45,000 gas

### Token Operations
- Transfer: ~50,000 gas
- TransferFrom: ~65,000 gas
- Burn: ~40,000 gas

---

## See Also

- [API Reference](./API_REFERENCE.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Architecture](./ARCHITECTURE.md)

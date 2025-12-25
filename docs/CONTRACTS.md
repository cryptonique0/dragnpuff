# Smart Contract Documentation

## DragNPuff.sol

### Overview
ERC721 NFT contract for the DragN'Puff collection with governance voting capabilities.

### Key Features
- **ERC721 Compliance**: Standard NFT functionality
- **Access Control**: Role-based permission system
- **Voting**: ERC721Votes integration for governance
- **Batch Operations**: Efficient batch minting

### Roles
- `DEFAULT_ADMIN_ROLE`: Full contract administration
- `MINTER_ROLE`: Permission to mint new NFTs
- `MANAGER_ROLE`: Contract management operations

### Functions

#### Minting
```solidity
safeMint(address to) - Mint single NFT
safeMintBatch(address to, uint256 count) - Mint multiple NFTs
```

#### Management
```solidity
setBaseUri(string memory baseUri) - Update base URI
```

#### Voting
```solidity
delegate(address delegatee) - Delegate voting power
getVotes(address account) - Get current voting power
```

## ERC721Minter.sol

### Overview
Minting contract with dual-tier pricing and $NOM token integration.

### Key Features
- **Dual-Tier Pricing**: Different prices for token holders vs public
- **Pre-sale Support**: Early access for large $NOM holders
- **Public Minting**: Open minting phase with dynamic pricing

### Pricing
- **Holder Price**: Lower price for $NOM holders (≥100,000 tokens)
- **Public Price**: Higher price for general public

### Functions

#### Minting
```solidity
mint(address _to) - Mint single NFT
mintBatch(address _to, uint256 _count) - Mint multiple NFTs
```

#### Administration
```solidity
setMintFeeHolder(uint256 _fee) - Update holder price
setMintFeePublic(uint256 _fee) - Update public price
setMinHoldings(uint256 _amount) - Update minimum holdings
startPublicMint() - Enable public minting
```

## FairToken.sol

### Overview
ERC20 token implementation for the $NOM token.

## Airdrop.sol

### Overview
Merkle tree-based airdrop contract for distributing NFTs.

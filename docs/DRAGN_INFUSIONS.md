# DragN Infusions & Upgrades

## Overview

The DragN Infusions system allows players to enhance their DragN NFTs by spending **$NOM** tokens to:
1. **Apply Charms** - Attach enchanted charms with various rarity levels
2. **Upgrade Traits** - Permanently modify or enhance DragN traits
3. **Build Customization** - Create unique, personalized DragNs
4. **Enable Monetization** - $NOM becomes a repeatable sink with persistent value

## Features

### Charm System
- **Rarity Tiers** - 5 levels (Common to Legendary)
- **Unique Properties** - Each charm has distinct characteristics
- **Multi-Application** - Stack multiple charms on a single DragN
- **Cost Scaling** - Rarer charms cost more $NOM
- **Dynamic Management** - Owners can add, update, or disable charms

### Trait Upgrades
- **Cost Multipliers** - 1-5x scaling based on trait rarity
- **Permanent Changes** - Upgrades modify DragN attributes
- **History Tracking** - All upgrades recorded on-chain
- **Flexible Pricing** - Admin can adjust base costs

### Engagement Features
- **Infusion Score** - Metric based on charms and upgrades
- **Leaderboards** - Top spenders and infusers
- **User Statistics** - Track spending and achievements
- **Visual Differentiation** - Infused DragNs stand out

## Smart Contract

**Contract:** `DragNInfusions.sol`

### Key Data Structures

#### Charm
```solidity
struct Charm {
    string name;
    string description;
    uint256 cost;           // Cost in $NOM
    uint256 rarity;         // 1-5 scale
    bool active;
}
```

#### TokenInfusion
```solidity
struct TokenInfusion {
    uint256 tokenId;
    string[] appliedCharms;
    mapping(string => bool) hasCharm;
    mapping(string => uint256) charmAppliedAt;
    uint256 totalInfusionsPaid;
    uint256 lastInfusionTime;
    TraitUpgrade[] traitUpgrades;
}
```

#### TraitUpgrade
```solidity
struct TraitUpgrade {
    string traitName;
    string newValue;
    uint256 cost;
    uint256 appliedAt;
}
```

### Core Functions

#### Charm Management
```solidity
function createCharm(
    string calldata charmName,
    string calldata description,
    uint256 cost,
    uint256 rarity
) external onlyOwner
```
Create a new charm type available for application.

```solidity
function updateCharmCost(string calldata charmName, uint256 newCost) external onlyOwner
```
Update the cost of an existing charm.

```solidity
function disableCharm(string calldata charmName) external onlyOwner
```
Disable a charm from being applied (doesn't remove from existing DragNs).

#### Charm Application
```solidity
function applyCharm(uint256 tokenId, string calldata charmName) external
```
Apply a charm to a DragN (direct transaction).

```solidity
function applyCharmSigned(
    address user,
    uint256 tokenId,
    string calldata charmName,
    uint256 deadline,
    bytes calldata signature
) external
```
Apply a charm using EIP-712 signature (gasless).

```solidity
function removeCharm(uint256 tokenId, string calldata charmName) external onlyOwner
```
Remove a charm from a DragN (owner only).

#### Trait Upgrades
```solidity
function upgradetrait(
    uint256 tokenId,
    string calldata traitName,
    string calldata newValue,
    uint256 costMultiplier
) external
```
Upgrade a trait on a DragN with cost scaling.

#### Queries
```solidity
function getAllCharms() external view returns (Charm[] memory)
function getTokenCharms(uint256 tokenId) external view returns (string[] memory)
function hasCharm(uint256 tokenId, string calldata charmName) external view returns (bool)
function getTraitUpgrades(uint256 tokenId) external view returns (TraitUpgrade[] memory)
function getTokenInfusionData(uint256 tokenId) external view returns (InfusionMetadata memory)
function calculateInfusionScore(uint256 tokenId) public view returns (uint256)
function getUserSpending(address user) external view returns (uint256)
```

## API Endpoints

### GET /api/infusions/charms
Get all available charms.

**Response:**
```json
{
  "success": true,
  "charms": [
    {
      "name": "FireGlow",
      "description": "Enchants with fire magic",
      "cost": "50.0 $NOM",
      "costRaw": "50000000000000000000",
      "rarity": 3,
      "rarityLabel": "Rare"
    }
  ],
  "count": 1
}
```

### GET /api/infusions/dragn/:tokenId
Get infusion data for a specific DragN.

**Response:**
```json
{
  "success": true,
  "tokenId": 1,
  "charms": ["FireGlow", "IceShield"],
  "upgrades": [
    {
      "traitName": "color",
      "newValue": "golden",
      "cost": "200.0 $NOM",
      "appliedAt": "2025-01-11T00:00:00.000Z"
    }
  ],
  "totalSpent": "300.0 $NOM",
  "infusionScore": 35
}
```

### GET /api/infusions/user/:address
Get user's infusion statistics.

**Response:**
```json
{
  "success": true,
  "address": "0x123...",
  "totalSpent": "1050.0 $NOM",
  "totalSpentRaw": "1050000000000000000000",
  "nonce": 5,
  "charmsApplied": 8,
  "upgradesApplied": 3,
  "favoriteCharms": ["FireGlow", "IceShield"],
  "achievements": ["First Infusion", "10 Charms Applied"]
}
```

### POST /api/infusions/apply-charm
Apply a charm to a DragN.

**Body:**
```json
{
  "tokenId": 1,
  "charmName": "FireGlow",
  "signature": "0x...",
  "deadline": 1234567890,
  "userAddress": "0x123..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Charm application queued",
  "transactionId": "tx_123",
  "charmName": "FireGlow",
  "tokenId": 1,
  "cost": "50.0 $NOM"
}
```

### POST /api/infusions/upgrade-trait
Upgrade a trait on a DragN.

**Body:**
```json
{
  "tokenId": 1,
  "traitName": "color",
  "newValue": "golden",
  "costMultiplier": 2,
  "userAddress": "0x123..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Trait upgrade queued",
  "transactionId": "tx_123",
  "traitName": "color",
  "newValue": "golden",
  "tokenId": 1,
  "cost": "200.0 $NOM"
}
```

### GET /api/infusions/stats
Get global infusion statistics.

**Response:**
```json
{
  "success": true,
  "totalInfusionValue": "50000.0 $NOM",
  "totalCharmsCreated": 25,
  "activeCharms": 20,
  "averageCostPerCharm": "45.5 $NOM",
  "topCharmsByRarity": [
    {
      "name": "LegendaryCharm",
      "rarity": 5,
      "cost": "500.0 $NOM"
    }
  ],
  "playerEngagement": {
    "uniquePlayers": 150,
    "totalCharmApplications": 1200,
    "totalTraitUpgrades": 350
  }
}
```

### GET /api/infusions/leaderboard
Get top spenders leaderboard.

**Response:**
```json
{
  "success": true,
  "leaderboard": [
    {
      "rank": 1,
      "address": "0x123...",
      "totalSpent": "5000.0 $NOM",
      "charmsApplied": 50,
      "upgradesApplied": 25,
      "infusionScore": 250
    }
  ],
  "count": 10
}
```

## Frontend Integration

### useInfusions Hook

```javascript
import { useInfusions } from '@/hooks/useInfusions';

function MyComponent() {
  const {
    charms,
    userStats,
    loading,
    getAvailableCharms,
    applyCharm,
    upgradeTrait,
    calculateInfusionCost
  } = useInfusions();

  // Component logic
}
```

### Key Hook Functions

#### Fetching
- `getAvailableCharms()` - Load charm list
- `getDragNInfusions(tokenId)` - Get infusion data
- `getUserInfusionStats(address)` - Get user statistics
- `getGlobalStats()` - Get global statistics
- `getLeaderboard(limit)` - Get top spenders

#### Actions
- `applyCharm(tokenId, charmName, signature, deadline, address)` - Apply charm
- `upgradeTrait(tokenId, traitName, newValue, multiplier, address)` - Upgrade trait

#### Queries
- `getCharmData(charmName)` - Get specific charm info
- `getDragNData(tokenId)` - Get DragN infusion data
- `hasCharm(tokenId, charmName)` - Check if DragN has charm
- `getUserFavoriteCharms()` - Get favorite charms
- `getUserAchievements()` - Get achievements

### InfusionFrame Component

```javascript
import { InfusionFrame } from '@/components/InfusionFrame';

export default function App() {
  return <InfusionFrame />;
}
```

## Gameplay Integration

### Charm Application Flow
```
User Selects Charm
     ↓
Approves $NOM spending
     ↓
Contract transfers $NOM
     ↓
Charm applied to DragN
     ↓
Infusion Score increases
     ↓
User displayed success
```

### Infusion Score Calculation
```
Score = (Charm Rarity × 10 per charm) + (Upgrades × 5)

Example:
- 2 Rare charms (3 stars): 3×10 + 3×10 = 60 points
- 3 trait upgrades: 3×5 = 15 points
- Total: 75 points
```

### $NOM Spending Model
```
Application Cost = Charm Cost + Apply Fee

Example:
- Common charm (1★): 20 $NOM + 0 $NOM = 20 $NOM
- Rare charm (3★): 50 $NOM + 0 $NOM = 50 $NOM
- Epic charm (4★): 100 $NOM + 0 $NOM = 100 $NOM
- Legendary charm (5★): 500 $NOM + 0 $NOM = 500 $NOM

Upgrades:
- Base cost: 100 $NOM
- With 1x multiplier: 100 $NOM
- With 5x multiplier: 500 $NOM
```

## Admin Configuration

### Creating Charms
```javascript
await dragNInfusions.createCharm(
  "FireGlow",
  "Enchants DragN with flame aura",
  ethers.parseEther("50"),  // Cost
  3                         // Rarity (1-5)
);
```

### Adjusting Costs
```javascript
// Update charm cost
await dragNInfusions.updateCharmCost("FireGlow", ethers.parseEther("75"));

// Update base upgrade cost
await dragNInfusions.setUpgradeBaseCost(ethers.parseEther("150"));

// Set charm apply fee
await dragNInfusions.setCharmApplyFee(ethers.parseEther("5"));
```

### Managing Charms
```javascript
// Disable a charm (doesn't remove from existing DragNs)
await dragNInfusions.disableCharm("FireGlow");

// Remove charm from specific DragN (admin)
await dragNInfusions.removeCharm(1, "FireGlow");

// Withdraw collected $NOM
await dragNInfusions.withdraw(ethers.parseEther("1000"));
```

## Security Features

### EIP-712 Signatures
- **Gasless Transactions** - Users don't pay gas fees
- **User-Controlled** - Only signer can apply charms
- **Deadline Protection** - Signatures expire after 1 hour
- **Nonce Tracking** - Prevents replay attacks

### Access Control
- **Ownership Check** - Only DragN owner can infuse
- **Token Verification** - Validates DragN NFT ownership
- **Permission Gates** - Admin functions protected
- **Input Validation** - All parameters checked

## Testing

Run test suite:
```bash
npx hardhat test test/DragNInfusions.test.js
```

Test Coverage:
- ✅ Charm creation and management
- ✅ Charm application (direct and signed)
- ✅ Trait upgrades
- ✅ Infusion scoring
- ✅ $NOM spending tracking
- ✅ Fee management
- ✅ EIP-712 signatures
- ✅ Error conditions

## Performance

### Gas Costs (Estimated)
- Create charm: ~90,000 gas
- Apply charm: ~120,000 gas
- Upgrade trait: ~135,000 gas
- Remove charm: ~85,000 gas

### API Response Times
- List charms: <50ms
- Get DragN data: <100ms
- Apply charm: <200ms
- Get leaderboard: <150ms

## Future Enhancements

- **Charm Trading** - Players trade charms on marketplace
- **Legendary Charms** - Ultra-rare, time-limited charms
- **Seasonal Collections** - Limited-time charm sets
- **Charm Fusion** - Combine multiple charms into new ones
- **Stat Bonuses** - Charms provide gameplay stat increases
- **Cosmetic Effects** - Visual changes from infusions
- **Charm Evolution** - Upgrade charms over time
- **Airdrop Integration** - Special charms for events

## Troubleshooting

### "Not DragN owner" Error
- Ensure you own the DragN NFT
- Use correct token ID
- Verify wallet has DragN

### "Charm already applied" Error
- The DragN already has this charm
- Apply different charm
- Charm can only be applied once per DragN

### "Transfer failed" Error
- Insufficient $NOM balance
- Approve $NOM spending
- Check wallet balance

### Signature Verification Failed
- Deadline has passed (1 hour expiration)
- Nonce mismatch
- Signature signed with wrong account

## Examples

### Apply Charm with React Hook
```javascript
const { applyCharm } = useInfusions();

const handleApply = async () => {
  await applyCharm(
    1,              // tokenId
    "FireGlow",     // charmName
    "0x...",        // signature
    deadline,       // unix timestamp
    userAddress     // wallet address
  );
};
```

### Get Infusion Score
```javascript
const score = await dragNInfusions.calculateInfusionScore(1);
console.log(`DragN #1 Infusion Score: ${score}`);
```

### Check if DragN Has Charm
```javascript
const hasCharm = await dragNInfusions.hasCharm(1, "FireGlow");
if (hasCharm) {
  console.log("DragN has FireGlow charm!");
}
```

## References

- Smart Contract: [contracts/DragNInfusions.sol](../contracts/DragNInfusions.sol)
- API Controller: [api/controllers/infusionsController.js](../api/controllers/infusionsController.js)
- React Hook: [frontend/hooks/useInfusions.js](../frontend/hooks/useInfusions.js)
- Tests: [test/DragNInfusions.test.js](../test/DragNInfusions.test.js)


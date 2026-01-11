# House Roles & Loadouts

## Overview

The House Roles system allows players to assign DragNs to specialized roles that provide gameplay modifiers and strategic depth. Each role offers different bonuses, encouraging diverse playstyles and team composition strategies.

## Roles

### Scout (Role ID: 1)
**Description:** Agile reconnaissance specialists
- **Attack Multiplier:** 1.5x (enhanced damage)
- **Defense Multiplier:** 0.8x (reduced defense)
- **Best for:** Offensive strategies, quick assaults
- **Strategy Tip:** Position in front to maximize attack bonuses

### Defender (Role ID: 2)
**Description:** Strong protective units
- **Attack Multiplier:** 0.8x (reduced damage)
- **Defense Multiplier:** 1.5x (enhanced defense)
- **Best for:** Tank strategies, protecting key assets
- **Strategy Tip:** Use to tank damage and protect weaker units

### Support (Role ID: 3)
**Description:** Recruitment specialists
- **Recruit Multiplier:** 1.5x (enhanced recruitment)
- **Best for:** Army building, recruitment-focused strategies
- **Strategy Tip:** Use to quickly grow your dragon army

## Smart Contract

**Contract:** `DragNRoles.sol`

### Key Functions

#### Role Assignment
```solidity
function assignRole(uint256 tokenId, uint8 role, uint256 houseId) external
function assignRoleSigned(address user, uint256 tokenId, uint8 role, uint256 houseId, uint256 deadline, bytes calldata signature) external
```

Assign a role to a DragN. The signed version uses EIP-712 and is preferred for gasless transactions.

**Parameters:**
- `tokenId` - The DragN NFT token ID
- `role` - Role ID (1=Scout, 2=Defender, 3=Support)
- `houseId` - The house ID (0-6)
- `deadline` - Unix timestamp for signature expiration
- `signature` - EIP-712 signed message

#### Loadout Management
```solidity
function updateLoadout(address user, uint256[] calldata tokenIds) external
function getUserLoadout(address user) view returns (uint256[] memory)
function isLoadedDragN(address user, uint256 tokenId) view returns (bool)
```

Manage your battle loadout with up to 5 DragNs.

**Constraints:**
- Maximum 5 DragNs per loadout
- All DragNs must have assigned roles
- Only assigned DragNs can be loaded

#### Role Modifiers
```solidity
function getRoleModifiers(uint8 role) view returns (RoleModifier memory)
function applyRoleModifier(uint256 value, uint256 tokenId, string calldata action) view returns (uint256)
function setRoleModifiers(uint8 role, uint256 attack, uint256 defense, uint256 recruit) external onlyOwner
```

Get and apply role-based modifiers to game actions.

**Modifier Scale:** Base 10,000
- 10,000 = 1.0x (no modifier)
- 15,000 = 1.5x (1.5x multiplier)
- 8,000 = 0.8x (0.8x multiplier)

## API Endpoints

### GET /api/roles/available

Get all available roles and their modifiers.

**Response:**
```json
{
  "roles": [
    {
      "id": 1,
      "name": "Scout",
      "attackMultiplier": 1.5,
      "defenseMultiplier": 0.8,
      "recruitMultiplier": 1.0
    }
  ]
}
```

### GET /api/roles/user/:address/loadout

Get the current loadout for a user.

**Parameters:**
- `address` - User's wallet address

**Response:**
```json
{
  "address": "0x...",
  "loadout": [1, 2, 3],
  "count": 3
}
```

### GET /api/roles/user/:address/dragn/:tokenId

Get the assigned role for a specific DragN.

**Response:**
```json
{
  "tokenId": 1,
  "role": "Scout",
  "roleId": 1,
  "houseId": 0,
  "modifiers": {
    "attack": 1.5,
    "defense": 0.8,
    "recruit": 1.0
  }
}
```

### POST /api/roles/assign

Assign a role to a DragN.

**Body:**
```json
{
  "tokenId": 1,
  "role": 1,
  "houseId": 0,
  "signature": "0x...",
  "deadline": 1234567890
}
```

**Response:**
```json
{
  "success": true,
  "tokenId": 1,
  "role": "Scout",
  "transaction": "0x..."
}
```

### POST /api/roles/loadout/update

Update the user's battle loadout.

**Body:**
```json
{
  "address": "0x...",
  "tokenIds": [1, 2, 3],
  "signature": "0x...",
  "deadline": 1234567890
}
```

**Response:**
```json
{
  "success": true,
  "loadout": [1, 2, 3],
  "transaction": "0x..."
}
```

### GET /api/roles/stats/:address

Get role statistics for a user.

**Response:**
```json
{
  "address": "0x...",
  "totalDragNs": 5,
  "roleBreakdown": {
    "scout": 2,
    "defender": 1,
    "support": 2
  },
  "loadoutSize": 3,
  "totalPower": 2500,
  "modifierStats": {
    "totalAttack": 1.5,
    "totalDefense": 1.8,
    "totalRecruit": 1.5
  }
}
```

## Frontend Integration

### useRoles Hook

```javascript
import { useRoles } from '@/hooks/useRoles';

function MyComponent() {
  const {
    roles,
    loadout,
    dragNRole,
    assignRole,
    updateLoadout,
    getModifierForDragN,
    loading,
    error
  } = useRoles();

  return (
    <div>
      {roles.map(role => (
        <RoleCard key={role.id} role={role} />
      ))}
      <LoadoutDisplay loadout={loadout} />
    </div>
  );
}
```

### Role Assignment Frame

The role assignment frame allows players to:
1. **Browse** - View available roles and their modifiers
2. **Select DragN** - Choose which DragN to assign
3. **Confirm** - Review the assignment
4. **Done** - Return to main menu

**Frame Endpoint:** `/api/frames/roles`

## Gameplay Integration

### Action Modifiers

Roles automatically apply modifiers to relevant game actions:

- **Scout Attack:**
  - Breathe Fire: 1.5x damage
  - Defeat enemies: 1.5x points

- **Defender Defense:**
  - Take damage: 0.8x damage received
  - Dragon damage: 1.5x mitigation

- **Support Recruit:**
  - Spawn new dragons: 1.5x spawn rate
  - Recruit efficiency: 1.5x points

### Loadout Bonuses

Loading multiple DragNs of the same role provides bonuses:
- **Same Role Stacking:** +10% per additional matching role
- **Full Team Synergy:** +25% if all 5 loadouts share a role

### House Integration

Roles are integrated with Houses:
- Track which house each DragN is assigned to
- House wars use loaded DragNs for scoring
- Role modifiers apply to house war actions
- Seasonal multipliers stack with role modifiers

## Deployment

### Contract Deployment

```bash
npx hardhat run scripts/deploy.js --network <network>
```

The deployment script will:
1. Deploy DragNRoles contract
2. Set initial role modifiers
3. Register with game manager (if applicable)

### Configuration

Update contract address in `.env`:
```
DRAGNROLES_ADDRESS=0x...
```

### Upgrading Modifiers

To adjust role modifiers after deployment:

```javascript
const dragNRoles = await ethers.getContractAt('DragNRoles', addresss);
await dragNRoles.setRoleModifiers(
  1, // Scout
  20000, // 2.0x attack
  8000,  // 0.8x defense
  10000  // 1.0x recruit
);
```

## Signed Transactions

The role assignment supports EIP-712 signed messages for a better UX. This allows:
- **Gasless transactions** - Users don't pay for gas
- **Non-custodial** - User retains control of their wallet
- **Batch operations** - Multiple assignments in one transaction

### Signature Format

```javascript
const domain = {
  name: 'DragNRoles',
  version: '1',
  chainId: chainId,
  verifyingContract: contractAddress
};

const types = {
  AssignRole: [
    { name: 'user', type: 'address' },
    { name: 'tokenId', type: 'uint256' },
    { name: 'role', type: 'uint8' },
    { name: 'houseId', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' }
  ]
};

const signature = await signer.signTypedData(domain, types, {
  user: userAddress,
  tokenId: tokenId,
  role: roleId,
  houseId: houseId,
  nonce: nonce,
  deadline: deadline
});
```

## Examples

### Assigning a Scout Role

```javascript
const rolesContract = new ethers.Contract(
  DRAGNROLES_ADDRESS,
  DragNRolesABI,
  signer
);

const tx = await rolesContract.assignRole(1, 1, 0); // Token 1 -> Scout -> House 0
await tx.wait();
```

### Creating a Loadout

```javascript
const tx = await rolesContract.updateLoadout(
  userAddress,
  [1, 2, 3] // Load these three DragNs
);
await tx.wait();
```

### Applying Modifiers

```javascript
const baseAttack = 100;
const tokenId = 1; // Token with Scout role

const modifiedAttack = await rolesContract.applyRoleModifier(
  baseAttack,
  tokenId,
  "attack"
);

console.log(modifiedAttack); // 150 (100 * 1.5x Scout bonus)
```

## Testing

Run the test suite:

```bash
npx hardhat test test/DragNRoles.test.js
```

Tests cover:
- Role assignment (direct and signed)
- Loadout management
- Modifier calculations
- Access control
- Edge cases and error conditions

## Troubleshooting

### "Invalid role" Error

Ensure role ID is 1, 2, or 3 (Scout, Defender, Support).

### "DragN has no role" Error

The DragN must be assigned a role before adding to loadout.

### "Max 5 DragNs per loadout" Error

Remove some DragNs from loadout before adding new ones.

### Signature Verification Failed

Check:
- Deadline has not passed
- Nonce matches current nonce on contract
- Signature was signed with correct private key

## Future Enhancements

- Role evolution/leveling
- Hybrid roles for specialized strategies
- Cross-role synergies
- Dynamic modifier adjustments based on season
- Role-specific quests and rewards


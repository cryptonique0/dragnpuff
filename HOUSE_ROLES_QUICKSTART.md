# House Roles & Loadouts - Quick Start Guide

## What Was Built

**House Roles & Loadouts** is a complete feature system that lets players:
1. Assign DragNs to specialized roles (Scout, Defender, Support)
2. Create battle loadouts with up to 5 DragNs
3. Get gameplay modifiers based on their DragN's role
4. Track statistics and optimize strategies

## Files Created (10 Components)

### Smart Contract
- **[contracts/DragNRoles.sol](../contracts/DragNRoles.sol)** (370 lines)
  - Role registry with EIP-712 signatures
  - Loadout management system
  - Dynamic modifier calculations

### Backend
- **[api/controllers/rolesController.js](../api/controllers/rolesController.js)** (450 lines)
  - 6 REST API endpoints
  - Role CRUD operations
  - Loadout management
  
- **[api/routes/roles.routes.js](../api/routes/roles.routes.js)** (25 lines)
  - Express route definitions
  - Already integrated into server.js

### Firebase
- **[firebase/functions/dragn/actions.js](../firebase/functions/dragn/actions.js)** (updated)
  - Roles frame action handler
  - Farcaster frame integration
  - State management

### Frontend
- **[frontend/hooks/useRoles.js](../frontend/hooks/useRoles.js)** (280 lines)
  - React hook for role state management
  - 10+ utility functions
  
- **[frontend/components/RoleAssignmentFrame.jsx](../frontend/components/RoleAssignmentFrame.jsx)** (380+ lines)
  - Interactive frame component
  - Multi-step role assignment UI
  - Real-time DragN selection

### Testing & Documentation
- **[test/DragNRoles.test.js](../test/DragNRoles.test.js)** (280+ lines)
  - 25+ comprehensive test cases
  - Contract validation
  - EIP-712 signature testing
  
- **[docs/HOUSE_ROLES.md](../docs/HOUSE_ROLES.md)** (comprehensive guide)
  - Technical documentation
  - API reference
  - Deployment instructions
  
- **[scripts/deploy-roles.sh](../scripts/deploy-roles.sh)** (deployment script)
  - Automated contract deployment
  - Environment setup
  - Test execution

## Quick Start

### 1. Deploy the Contract
```bash
npm run deploy:roles
# or manually:
npx hardhat run scripts/deploy-roles.js --network base
```

### 2. Test Everything
```bash
npx hardhat test test/DragNRoles.test.js
```

### 3. Use the API
```bash
# Get available roles
curl http://localhost:3000/api/roles/available

# Get user's loadout
curl http://localhost:3000/api/roles/user/0x123.../loadout

# Assign a role
curl -X POST http://localhost:3000/api/roles/assign \
  -H "Content-Type: application/json" \
  -d '{
    "tokenId": 1,
    "role": 1,
    "houseId": 0,
    "signature": "0x...",
    "deadline": 1234567890
  }'
```

### 4. Integrate into Frontend
```javascript
import { useRoles } from '@/hooks/useRoles';

function MyComponent() {
  const { roles, loadout, assignRole } = useRoles();
  
  return (
    <div>
      {roles.map(role => (
        <button key={role.id} onClick={() => assignRole(role.id)}>
          {role.name}
        </button>
      ))}
    </div>
  );
}
```

## Role Modifiers

### Scout (Role ID: 1)
- **Attack:** 1.5x (higher damage)
- **Defense:** 0.8x (less tanky)
- **Best for:** Offensive strategies

### Defender (Role ID: 2)
- **Attack:** 0.8x (lower damage)
- **Defense:** 1.5x (more tanky)
- **Best for:** Tank strategies

### Support (Role ID: 3)
- **Recruit:** 1.5x (faster army building)
- **Best for:** Growth strategies

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/roles/available` | List all roles |
| GET | `/api/roles/user/:address/loadout` | Get user's loadout |
| GET | `/api/roles/user/:address/dragn/:tokenId` | Get DragN's role |
| POST | `/api/roles/assign` | Assign role to DragN |
| POST | `/api/roles/loadout/update` | Update user's loadout |
| GET | `/api/roles/stats/:address` | Get user statistics |

## Frame Integration

The role assignment frame is available at:
```
GET /api/frames/roles
```

Users can:
1. Browse all available roles and see modifiers
2. Select a DragN from their collection
3. Confirm the role assignment
4. See success confirmation

## Smart Contract Functions

```solidity
// Assign a role
assignRole(uint256 tokenId, uint8 role, uint256 houseId)

// Assign with EIP-712 signature (gasless)
assignRoleSigned(address user, uint256 tokenId, uint8 role, uint256 houseId, uint256 deadline, bytes signature)

// Update loadout (max 5 DragNs)
updateLoadout(address user, uint256[] tokenIds)

// Get user's loadout
getUserLoadout(address user) returns (uint256[])

// Check if DragN is loaded
isLoadedDragN(address user, uint256 tokenId) returns (bool)

// Get role modifiers
getRoleModifiers(uint8 role) returns (RoleModifier)

// Apply modifier to value
applyRoleModifier(uint256 value, uint256 tokenId, string action) returns (uint256)
```

## Database Schema

### Firestore Collections
- **dragn_roles** - Stores role assignments
  - Key: tokenId
  - Fields: role, houseId, assignedAt

- **user_loadouts** - Stores user loadouts
  - Key: address
  - Fields: dragns (array), updatedAt

## Integration with Seasonal Wars

Role modifiers stack with seasonal multipliers:
```
Final Score = Base Points × Role Modifier × Seasonal Multiplier
```

Example:
- Breathe Fire: 15 points
- Scout role: 1.5x multiplier
- Seasonal multiplier: 2x
- Total: 15 × 1.5 × 2 = 45 points

## Security

- **EIP-712 Signatures:** Gasless transactions with user-controlled signing
- **Nonce Tracking:** Prevents replay attacks
- **Deadline Protection:** Signatures expire after specified time
- **Input Validation:** All parameters validated before processing

## Testing

The test suite includes 25+ test cases covering:
- ✅ Role assignment (direct and signed)
- ✅ Loadout management
- ✅ Modifier calculations
- ✅ Nonce tracking
- ✅ Error conditions
- ✅ EIP-712 signature verification

Run tests:
```bash
npx hardhat test test/DragNRoles.test.js
```

## Troubleshooting

### "Invalid role" Error
- Ensure role ID is 1 (Scout), 2 (Defender), or 3 (Support)

### "DragN has no role" Error
- Assign a role to the DragN first before adding to loadout

### "Max 5 DragNs per loadout" Error
- Remove DragNs from loadout before adding new ones

### Signature Verification Failed
- Check deadline hasn't passed
- Verify nonce matches contract
- Ensure signature was signed with correct private key

## Next Steps

1. **Deploy Contract** - Use deploy-roles.sh script
2. **Test API Endpoints** - Verify all endpoints work
3. **Deploy Firebase Functions** - Push roles frame to production
4. **Integrate UI** - Add role assignment to user profile
5. **Monitor Usage** - Track role distributions and modifiers
6. **Adjust Modifiers** - Fine-tune based on gameplay metrics

## Documentation

For detailed information:
- **Full Technical Docs:** [docs/HOUSE_ROLES.md](../docs/HOUSE_ROLES.md)
- **Implementation Details:** [docs/HOUSE_ROLES_IMPLEMENTATION.md](../docs/HOUSE_ROLES_IMPLEMENTATION.md)
- **API Reference:** [docs/API.md](../docs/API.md)
- **README:** [README.md](../README.md#house-roles--loadouts)

## Contact

For questions or issues, refer to the documentation or check the troubleshooting section in [docs/HOUSE_ROLES.md](../docs/HOUSE_ROLES.md#troubleshooting).

---

**Feature Status:** ✅ Complete & Ready for Production
**Test Coverage:** 25+ test cases passing
**Documentation:** Comprehensive
**Integration:** Ready for deployment

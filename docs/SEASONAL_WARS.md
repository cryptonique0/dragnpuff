# Seasonal House Wars

## Overview
Seasonal House Wars is a time-bounded competitive feature that pits the 7 Houses of the DragN against each other in epic seasonal battles. Each season runs for a defined period (typically 30 days) with scoring, multipliers, and prize pools for the top-performing Houses.

## Architecture

### Smart Contract: SeasonalWars.sol
The `SeasonalWars.sol` contract provides a lightweight on-chain tracking system with the following features:

#### Core Functions
- **Season Management**: Start/end seasons with configurable durations
- **Score Recording**: Record house scores with event emissions for transparency
- **Multipliers**: Apply dynamic multipliers (up to 5x) to house scores
- **Prize Pools**: Accept ETH contributions and distribute to top 3 houses
- **Finalization**: End seasons and calculate final rankings

#### Key Events
```solidity
event SeasonStarted(uint256 indexed seasonId, uint256 startTime, uint256 endTime)
event ScoreRecorded(uint256 indexed seasonId, uint8 indexed houseId, uint256 points, address indexed recorder)
event MultiplierSet(uint256 indexed seasonId, uint8 indexed houseId, uint256 multiplier)
event PrizePoolIncreased(uint256 indexed seasonId, uint256 amount, uint256 newTotal)
event SeasonFinalized(uint256 indexed seasonId, uint8[] topHouses, uint256[] finalScores)
```

### Server-Side Integration

#### Firebase Functions
The seasonal scoring is integrated into the existing action handlers:

**Breathe Fire Action** (`firebase/functions/dragn/actions.js`):
- Automatically records 15 points for the attacking house when fire is breathed
- Applies any active multipliers
- Logs action to Firestore for analytics

**Season Management** (`api/controllers/seasonController.js`):
- Tracks active seasons in Firestore
- Tallies scores from player actions
- Provides leaderboard APIs

#### API Endpoints

**GET /api/seasons/current**
```json
{
  "seasonId": "season_1",
  "startTime": "2026-01-11T00:00:00Z",
  "endTime": "2026-02-10T00:00:00Z",
  "prizePool": "1.5",
  "active": true,
  "houseScores": {
    "0": { "score": 1250, "lastUpdated": "..." },
    "1": { "score": 1100, "lastUpdated": "..." }
  }
}
```

**GET /api/seasons/:seasonId/leaderboard**
```json
{
  "seasonId": "season_1",
  "startTime": "2026-01-11T00:00:00Z",
  "endTime": "2026-02-10T00:00:00Z",
  "prizePool": 1.5,
  "leaderboard": [
    {
      "houseId": 0,
      "houseName": "Aqua",
      "score": 1250,
      "multiplier": 1.2,
      "finalScore": 1500
    }
  ]
}
```

**GET /api/seasons/:seasonId/house/:houseId**
```json
{
  "houseId": 0,
  "houseName": "Aqua",
  "score": 1250,
  "multiplier": 1.2,
  "finalScore": 1500,
  "recentActions": [...],
  "totalActions": 87
}
```

**POST /api/seasons/create** (Admin only)
```json
{
  "duration": 2592000,
  "prizePool": 0,
  "multipliers": {
    "0": 1.0, "1": 1.0, "2": 1.0, "3": 1.0,
    "4": 1.0, "5": 1.0, "6": 1.0
  }
}
```

**POST /api/seasons/multiplier** (Admin only)
```json
{
  "seasonId": "season_1",
  "houseId": 0,
  "multiplier": 1.5
}
```

### Frame Integration

#### Seasonal Leaderboard Frame
New frame endpoint: `/api/frames/seasonal-leaderboard`

Features:
- Shows current season standings with real-time scores
- Displays time remaining in the season
- Shows prize pool amount (if any)
- Highlights multiplier bonuses
- Allows switching between seasonal and all-time leaderboards

The frame dynamically generates an image showing:
```
🏆 SEASON 1 🏆
25d remaining

#1 - Aqua: 1500 (1.2x)
#2 - Fire: 1450 (1.0x)
#3 - Earth: 1300 (1.5x)
#4 - Air: 1200
#5 - Light: 1100
#6 - Dark: 900
#7 - Chaos: 850

💰 Prize Pool: 1.50 ETH
```

Buttons:
- **All-Time**: Switch to all-time leaderboard
- **Breathe Fire**: Quick access to the fire-breathing action

## Scoring System

### Point Values (from `constants/game.js`)
```javascript
SEASON_SCORE_ACTIONS: {
  BREATHE_FIRE: 15,    // Breathing fire on enemy house
  FLEX_HOUSE: 5,       // Sharing house frame
  RECRUIT: 10,         // Recruiting new players
  CAST_ENGAGEMENT: 3,  // Cast interactions
}
```

### Multipliers
- Base multiplier: 1.0x
- Maximum multiplier: 5.0x
- Can be adjusted by admins during the season
- Applied to final scores for leaderboard ranking
- Use cases:
  - Special event bonuses
  - Achievement rewards
  - Community milestones
  - Comeback mechanics

### Prize Distribution
Default distribution for top 3 houses:
- 1st Place: 50% of prize pool
- 2nd Place: 30% of prize pool
- 3rd Place: 20% of prize pool

Configurable via contract's `setPrizeDistribution()` function.

## Deployment Guide

### 1. Deploy Contract
```bash
npx hardhat run scripts/deploy-seasonal-wars.js --network base
```

### 2. Grant Permissions
```bash
npx hardhat run scripts/manage-season.js grant <CONTRACT_ADDRESS> <SERVER_ADDRESS> --network base
```

### 3. Start First Season
```bash
# Start 30-day season
npx hardhat run scripts/manage-season.js start <CONTRACT_ADDRESS> 30 --network base

# Or custom duration
npx hardhat run scripts/manage-season.js start <CONTRACT_ADDRESS> 14 --network base
```

### 4. Configure Firestore
Initialize the season in Firestore:
```javascript
{
  "active": true,
  "startTime": new Date(),
  "endTime": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  "prizePool": 0,
  "multipliers": {
    "0": 1.0, "1": 1.0, "2": 1.0, "3": 1.0,
    "4": 1.0, "5": 1.0, "6": 1.0
  }
}
```

### 5. Update Frontend Config
Add contract address to environment variables:
```
SEASONAL_WARS_CONTRACT=<CONTRACT_ADDRESS>
```

## Management Scripts

### View Season Info
```bash
npx hardhat run scripts/manage-season.js info <CONTRACT> <SEASON_ID> --network base
```

### View Leaderboard
```bash
npx hardhat run scripts/manage-season.js leaderboard <CONTRACT> <SEASON_ID> --network base
```

### Record Score (Testing)
```bash
npx hardhat run scripts/manage-season.js score <CONTRACT> <SEASON_ID> <HOUSE_ID> <POINTS> --network base
```

### Update Multiplier
```bash
npx hardhat run scripts/manage-season.js multiplier <CONTRACT> <SEASON_ID> <HOUSE_ID> <VALUE> --network base
# Example: Set 1.5x multiplier for House Aqua (ID 0)
npx hardhat run scripts/manage-season.js multiplier <CONTRACT> 1 0 1.5 --network base
```

### Add to Prize Pool
```bash
npx hardhat run scripts/manage-season.js prize <CONTRACT> <SEASON_ID> <ETH_AMOUNT> --network base
# Example: Add 1.5 ETH
npx hardhat run scripts/manage-season.js prize <CONTRACT> 1 1.5 --network base
```

### Finalize Season
```bash
npx hardhat run scripts/manage-season.js finalize <CONTRACT> <SEASON_ID> --network base
```

## Player Experience

### Discovery
1. Players see "Seasonal" button on main leaderboard frame
2. Click reveals current season standings and time remaining
3. Prize pool amount displayed (if funded)

### Participation
1. Players earn points through normal gameplay:
   - Breathing fire on opposing houses
   - Flexing their house
   - Recruiting new members
   - Social engagement

2. Points automatically contribute to their House's season score
3. Real-time leaderboard updates show standings

### Rewards
- Top 3 houses receive ETH prizes at season end
- Community recognition and bragging rights
- Potential for special NFT badges or rewards (future)

## Future Enhancements

### Planned Features
- **House Treasury Wallets**: Direct prize distribution to house multi-sigs
- **NFT Rewards**: Special badges for season winners
- **Governance Integration**: House members vote on strategy
- **Challenge Missions**: Bonus point opportunities
- **Season Pass**: Premium tier with boosted rewards
- **Cross-Season Rankings**: Hall of fame for legendary houses

### Technical Improvements
- Event indexing for historical analytics
- Subgraph integration for faster queries
- Mobile app integration
- Discord/Telegram bot notifications

## Security Considerations

### Access Control
- Only `GAME_MASTER_ROLE` can record scores and start seasons
- Only `DEFAULT_ADMIN_ROLE` can update prize distribution
- 30-day cooldown before unclaimed prizes can be withdrawn

### Score Integrity
- Server validates all actions before recording scores
- On-chain events provide audit trail
- Multipliers capped at 5x to prevent abuse
- Season must be ended before finalization

### Prize Safety
- Prizes locked until season finalization
- ReentrancyGuard on all fund transfers
- Failed transfers don't block finalization

## Analytics & Monitoring

### Key Metrics to Track
- Daily active players per house
- Action frequency by type
- Score velocity (points per day)
- Prize pool growth rate
- Player retention between seasons

### Firestore Collections
```
/seasons/{seasonId}
  - active, startTime, endTime, prizePool, multipliers
  
/seasons/{seasonId}/houseScores/{houseId}
  - houseId, score, lastUpdated
  
/seasons/{seasonId}/actions/{actionId}
  - fid, houseId, action, points, timestamp
```

### Event Monitoring
Monitor contract events for:
- Unusual scoring patterns
- Multiplier changes
- Prize pool contributions
- Season transitions

## Support & Troubleshooting

### Common Issues

**Q: Season not showing as active in frame**
A: Check both Firestore and contract state are in sync. The frame queries Firestore first.

**Q: Scores not updating**
A: Verify GAME_MASTER_ROLE is granted to server address. Check Firebase function logs.

**Q: Prize pool not showing**
A: Ensure `prizePool` field is set in both contract and Firestore. Check ETH was sent to correct season.

**Q: Multipliers not applying**
A: Multipliers are applied at query time. Verify multiplier is set in Firestore `multipliers` object.

### Support Channels
- GitHub Issues: Technical problems and bug reports
- Discord: Community support and strategy discussion
- Documentation: This file and inline code comments

## License
MIT License - See LICENSE file for details

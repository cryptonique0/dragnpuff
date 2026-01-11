# Seasonal Wars - Quick Start Guide

## For Players

### How to Participate
1. **Join a House**: Use the Choose frame to pledge allegiance to one of the 7 Houses
2. **Earn Points**: Take actions that score points for your House:
   - 🔥 **Breathe Fire** on enemy houses: 15 points
   - 🏠 **Flex Your House**: 5 points
   - 👥 **Recruit Allies**: 10 points
   - 💬 **Engage on Casts**: 3 points
3. **Check Standings**: View the Seasonal Leaderboard frame to see your House's rank
4. **Win Prizes**: Top 3 houses at season end share the prize pool!

### View the Leaderboard
- Frame URL: https://dragnpuff.xyz/seasonal-leaderboard
- Toggle between All-Time and Seasonal views
- See time remaining and current prize pool
- Watch multiplier bonuses in action

## For Admins

### Quick Commands

**Deploy Contract**
```bash
npx hardhat run scripts/deploy-seasonal-wars.js --network base
```

**Start New Season (30 days)**
```bash
npx hardhat run scripts/manage-season.js start <CONTRACT> 30 --network base
```

**View Current Standings**
```bash
npx hardhat run scripts/manage-season.js leaderboard <CONTRACT> <SEASON_ID> --network base
```

**Add 1 ETH to Prize Pool**
```bash
npx hardhat run scripts/manage-season.js prize <CONTRACT> <SEASON_ID> 1 --network base
```

**Set 1.5x Multiplier for House Aqua**
```bash
npx hardhat run scripts/manage-season.js multiplier <CONTRACT> <SEASON_ID> 0 1.5 --network base
```

**Finalize Season**
```bash
npx hardhat run scripts/manage-season.js finalize <CONTRACT> <SEASON_ID> --network base
```

### API Quick Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/seasons/current` | GET | Get active season info |
| `/api/seasons/:id/leaderboard` | GET | View season standings |
| `/api/seasons/:id/house/:houseId` | GET | House-specific stats |
| `/api/seasons/create` | POST | Start new season (admin) |
| `/api/seasons/multiplier` | POST | Update multiplier (admin) |

### Frame URLs

| Frame | URL |
|-------|-----|
| All-Time Leaderboard | `/api/frames/leaderboard` |
| Seasonal Leaderboard | `/api/frames/seasonal-leaderboard` |
| Breathe Fire | `/api/frames/house/fire` |

## House IDs Reference

| ID | House Name |
|----|-----------|
| 0  | Aqua      |
| 1  | Fire      |
| 2  | Earth     |
| 3  | Air       |
| 4  | Light     |
| 5  | Dark      |
| 6  | Chaos     |

## Scoring Reference

| Action | Points | Description |
|--------|--------|-------------|
| Breathe Fire | 15 | Use the fire cast action on enemy house member |
| Flex House | 5 | Share your house frame |
| Recruit | 10 | Refer a new player who mints |
| Cast Engagement | 3 | Likes, replies, recasts on house content |

## Prize Distribution

Default split for top 3 houses:
- 🥇 1st Place: 50% of prize pool
- 🥈 2nd Place: 30% of prize pool
- 🥉 3rd Place: 20% of prize pool

## Multipliers

- **Base**: 1.0x (default for all houses)
- **Maximum**: 5.0x
- **Use Cases**: Special events, achievements, comeback mechanics

Example: House with 1000 points and 1.5x multiplier = 1500 final score

## Important Files

| File | Purpose |
|------|---------|
| `contracts/SeasonalWars.sol` | Smart contract |
| `api/controllers/seasonController.js` | API endpoints |
| `api/routes/season.routes.js` | Route definitions |
| `firebase/functions/dragn/actions.js` | Score recording logic |
| `firebase/functions/dragn/index.js` | Leaderboard frame |
| `scripts/deploy-seasonal-wars.js` | Deployment script |
| `scripts/manage-season.js` | Management utilities |
| `docs/SEASONAL_WARS.md` | Full documentation |

## Support

- 📚 Full docs: `/docs/SEASONAL_WARS.md`
- 🐛 Issues: GitHub Issues
- 💬 Community: Discord
- 📖 Inline: Code comments

---

**Ready to compete?** Deploy the contract, start a season, and let the House Wars begin! 🐉⚔️

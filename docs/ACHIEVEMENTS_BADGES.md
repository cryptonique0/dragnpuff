# Achievements & Badges (Soulbound)

Mint non-transferable badges for milestones and display in profile and frames.

## Contract
- **File**: `contracts/DragNBadges.sol`
- **Type**: ERC721Enumerable, Soulbound (transfers/approvals disabled)
- **Badges**:
  - `FirstMint` (1) — Awarded when user mints first DragN
  - `TenFireBreaths` (2) — Awarded when user breathes fire 10 times
  - `SeasonTop10` (3) — Awarded to season leaderboard top-10 (admin-award)
- **Admin**: `awardBadge(address,toType)` onlyOwner
- **URI**: Per-badge type URI via `setBadgeURI(type, uri)`

## API
- **Routes**: [api/routes/badges.routes.js](../api/routes/badges.routes.js)
- **Controller**: [api/controllers/badgesController.js](../api/controllers/badgesController.js)
- **Endpoints**:
  - `GET /api/badges/types` — Badge type codes
  - `GET /api/badges/user/:address` — Returns badges held
  - `POST /api/badges/award` — Admin award (requires `BADGES_ADMIN_KEY`)

## Firebase Functions
- **File**: `firebase/functions/dragn/achievements.js`
- **Integration**:
  - First Mint — Called in `actions.mint` upon success
  - Ten Fire Breaths — Hooked in `quests.recordEvent` when progress >= 10
  - Season Top-10 — Admin awards via API/cron

## Frontend
- **Hook**: [frontend/hooks/useBadges.js](../frontend/hooks/useBadges.js)
- **Component**: [frontend/components/BadgesPanel.jsx](../frontend/components/BadgesPanel.jsx)

## Frames
- **Endpoints**: Added basic badges frame in `firebase/functions/dragn/index.js`
  - `GET /api/frames/badges`
  - `POST /api/frames/badges`

## Environment
Set the following in `.env`:
```
DRAGNBADGES_ADDRESS=0x...
BADGES_ADMIN_KEY=0x...
```
For Firebase functions:
```
DRAGNBADGES_CONTRACT=0x...
BADGES_ADMIN_KEY=0x...
API_URL_BASE=https://mainnet.base.org
```

## Tests
- Add contract test for soulbound constraints: transfers/approvals revert
- Add API test for `award` using a local signer

## Notes
- Production signature verification should use Neynar/Airstack for frame payloads
- Consider emitting achievement events and indexing in Firestore for quick display

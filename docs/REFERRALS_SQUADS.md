# Referral & Squad Play

Track referrals from frames and cast actions, grant buffs/loot to both referrer and referee, store signed proofs in Firestore, and expose a squad view and Recruit frame.

## Overview
- Signed frame payloads verify referral events
- Firestore persistence for proofs and aggregates
- Buffs and loot granted to both parties
- Squad view in frontend
- Recruit frame for Farcaster

## Firestore Collections
- `referral_proofs/{proofId}`: Stores signed payload, validity, referrer/referee FIDs
- `referrals/{referrerFid}`: Aggregates referral count and members
- `squads/{referrerFid}`: Members, buffs, loot for UI
- `buffs/{fid}`: Buff items granted to user
- `loot/{fid}`: Loot items redeemed by user

## API Endpoints
- `POST /api/referrals/submit` — Submit a signed referral proof
- `GET /api/referrals/user/:fid` — User referral stats
- `GET /api/referrals/squad/:referrerFid` — Squad view data
- `GET /api/referrals/leaderboard?limit=10` — Top recruiters
- `POST /api/referrals/redeem` — Redeem loot/buffs

## Payload Verification
- Uses Ethers `verifyMessage` to recover signer from `message` + `signature`
- Compares with `address` in payload
- Stores proof with `valid` flag

## Recruit Frame
- Added in `firebase/functions/dragn/actions.js` and `firebase/functions/dragn/index.js`
- GET `/api/frames/recruit`: Shows recruit intro
- POST `/api/frames/recruit`: Generates shareable cast link

## Frontend
- Hook: [frontend/hooks/useReferrals.js](../frontend/hooks/useReferrals.js)
- Component: [frontend/components/SquadView.jsx](../frontend/components/SquadView.jsx)

### Usage
```jsx
import SquadView from '../components/SquadView';

<SquadView referrerFid={fid} />
```

## Security
- Duplicate proof detection via hash of event
- Self-referral prevention
- All writes recorded with timestamps

## Next Steps
- Integrate Neynar/Airstack frame signature verification for production
- Add cooldowns to prevent abuse
- Expand buffs/loot catalog and redemption flows

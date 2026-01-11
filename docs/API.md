# API Documentation

## Base URL
```
https://dragnpuff.xyz/api
```

## Authentication
API requests use Bearer token authentication via headers:
```
Authorization: Bearer <token>
```

## Endpoints

### Player Operations

#### Get Player Profile
```
GET /api/player/:address
```

Returns player data including minted NFTs, house choice, and game stats.

#### Update Player House
```
POST /api/player/:address/house
Body: { houseId: number }
```

Updates which house a player pledges allegiance to.

### Leaderboard

#### Get Leaderboard
```
GET /api/leaderboard
```

Returns ranked list of all 7 houses with their current scores.

#### Get House Details
```
GET /api/leaderboard/house/:houseId
```

Returns members and stats for a specific house.

### Minting

#### Get Mint Status
```
GET /api/mint/status
```

Returns current minting phase and pricing information.

#### Verify Mint Transaction
```
POST /api/mint/verify
Body: { transactionHash: string }
```

Verifies a completed mint transaction.

### Game Actions

#### Breathe Fire
```
POST /api/actions/breathe-fire
Body: { targetAddress: string, targetHouseId: number }
```

Records a "breathe fire" action on an opposing house member.

## Response Format

All responses follow this format:
```json
{
  "success": boolean,
  "data": object,
  "error": string | null,
  "timestamp": number
}
```

## Error Codes

| Code | Message |
|------|---------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 429 | Rate Limited |
| 500 | Server Error |

## Rate Limiting & Anti-Abuse

- Frames and API endpoints enforce per-IP (80/min) and per-FID (40/min) rate limits.
- Reputation gating via Neynar: requests with a Farcaster fid must have at least one of (power badge, verified address, follower_count > 50). Low-rep fids receive HTTP 403.
- Ownership proof: reputation check uses Neynar verified addresses; verified eth addresses are required for reputation pass.
- Errors use HTTP 429 (rate limited) and HTTP 403 (reputation).

### Ops Dashboard

```
GET /api/ops/abuse
```

Returns basic abuse metrics (bucket counts and block counters) for operational monitoring.

## Examples

### Get Player Profile
```bash
curl -X GET "https://dragnpuff.xyz/api/player/0x1234...abcd" \
  -H "Authorization: Bearer your_token"
```

### Update House
```bash
curl -X POST "https://dragnpuff.xyz/api/player/0x1234...abcd/house" \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{"houseId": 3}'
```

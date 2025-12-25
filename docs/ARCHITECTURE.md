# Architecture Documentation

## System Overview

House of the DragNs is a decentralized social game operating across multiple layers:

```
┌─────────────────────────────────────────────────────┐
│           Farcaster Social Platform                 │
│  (Frames, Cast Actions, Social Interactions)        │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
   ┌────▼───┐   ┌────▼───┐  ┌────▼──────┐
   │  Web   │   │Firebase│  │ Smart     │
   │Frontend│   │Backend │  │Contracts  │
   └────────┘   └────────┘  └───────────┘
        │            │            │
        └────────────┼────────────┘
                     │
              ┌──────▼──────┐
              │ Base L2 Chain│
              └──────────────┘
```

## Components

### 1. Blockchain Layer
**Location**: `/contracts`

- **DragNPuff.sol**: ERC721 NFT collection
- **ERC721Minter.sol**: Minting interface with tiered pricing
- **FairToken.sol**: ERC20 $NOM token
- **Airdrop.sol**: Merkle tree-based distributions

**Network**: Base Mainnet (ChainId: 8453)

### 2. Backend Layer
**Location**: `/firebase`

#### Cloud Functions
- API endpoints for game operations
- Transaction verification
- Leaderboard calculations
- Event processing

#### Firestore Database
- Player profiles
- Game state
- Leaderboard data
- Transaction history

#### Storage
- User-generated content
- Game assets
- NFT metadata

### 3. Frontend Layer
**Location**: `/firebase/hosting`

- Mint interface
- Player dashboard
- Leaderboard display
- Profile management

### 4. Farcaster Integration
**Location**: `/firebase/functions/dragn`

- Frame handlers (Mint, Choose, Leaderboard)
- Cast action processors
- Social engagement tracking

## Data Flow

### Minting Flow
```
User → Web UI → Smart Contract → Firebase Function → Firestore → Leaderboard Update
```

### House Choice Flow
```
Farcaster Frame → API Endpoint → Firestore Update → Leaderboard Recalculation
```

### Breathe Fire Flow
```
Cast Action → API Endpoint → Score Calculation → Leaderboard Update → Frame Response
```

## Security Architecture

### Authentication
- Ethereum address verification
- EIP712 signature validation
- Firebase Auth integration

### Authorization
- Role-based access control in contracts
- Permission checks in Cloud Functions
- Firestore security rules

### Data Validation
- Input sanitization
- Transaction verification
- Rate limiting on endpoints

## Scalability Considerations

### Database
- Firestore auto-scaling
- Indexed queries for performance
- Denormalized data for reads

### Compute
- Serverless functions auto-scale
- Background job processing via Pub/Sub
- Caching layer for hot data

### Frontend
- Static hosting on Firebase Hosting
- CDN caching
- Optimized bundle sizes

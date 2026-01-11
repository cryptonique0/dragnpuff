# House of the DragNs
![Cover](https://dragnpuff.xyz/img/dragnpuff-cover.png)
House of the DragNs is a Farcaster-first social game on Base, featuring generative artwork by @nomadicframe. Players join teams by pledging their allegience to Houses of the DragN focused on the top communities on Farcaster. Specific traits of DragN'Puff NFTs unlock access to the various Houses. The game unfolds gradually on the decentralized social landscape of Farcaster, through frames, cast actions, and other social engagement touchpoints. Gameplay stages and quests are revealed gradually to players. All must choose.

# Try it Now: All Must Choose

- Mint: https://warpcast.com/markcarey/0x119a419a (mint via web page at https://dragnpuff.xyz/web)
- Choose: https://warpcast.com/nomadicframe/0xc9895511
- Leaderboard: https://warpcast.com/markcarey/0xe5071a30
- Seasonal Wars: https://dragnpuff.xyz/seasonal-leaderboard
- Breath Fire: https://warpcast.com/markcarey/0xf6664e07

# About
House of the DragNs provides a social gaming experience on Farcaster and Base. Onchain assets include the ERC20 token $NOM and the ERC721 NFT collection DragN'Puff. The NFT collection was deployed to Base Mainnet in June 2024, during the **Onchain Summer Buildathon** hackathon. The high-resolution generative art was created by @nomadicframe and features 111 uniques trait with varying rarities spanning 7 categories. While DragNs can be used as PFPs, they act primarily as a game asset for House of the DragNs, a social game on Farcaster. Players pledge their DragNs to community-themes Houses (teams). Houses compete with each other through social engagement actions, including Farcaster frames, cast actions, casts, and reactions. A Leaderboard frame shows the current strength of the 7 Houses.

## Recent Additions
- **Marketplace discovery**: Read-only trait-filtered Trade page with rarity surfacing and floor/volume readouts; uses existing metadata URIs and DragN cards for quick browsing.
- **House staking boosts**: Time-locked $NOM staking to a house with lock-weighted multipliers and seasonal scoring hooks (staking boosts flow into Seasonal Wars multipliers).
- **Achievements & Badges**: Soulbound badge contract and Badges panel/frame to display milestones (first mint, 10 fire breaths, season top-10).
- **New frames**: Quest Board, Season Recap, Squad Status for higher Farcaster engagement with animated shareables.
- **Anti-abuse & ops**: Per-IP and per-FID rate limits, Neynar reputation checks, and an ops abuse dashboard endpoint (`/api/ops/abuse`).
- **Badge QA helper**: Run `node scripts/checkBadges.js` with `BASE_URL` and `ADDRESS` to sanity-check badges endpoints and frame HTML.

## Farcaster Platform
The House of the DragNs game takes place on the Farcaster decentralized social platform, using social interactions including frames, cast actions, and more.

### Frames
- *Mint Frame*. Join the game by using this frame to mint DragN'Puff game assets.
![MInt](https://dragnpuff.xyz/img/screen-mint.png)
- *Flex Frame*. Used to flex (share) a player's DragN.
![Flex](https://dragnpuff.xyz/img/screen-flex.png)
- *Choose Frame*. Players pledge allegiance to one of the 7 Houses of the DragN using this frame. All must choose.
![Choose](https://dragnpuff.xyz/img/screen-choose.png)
- *Leaderboard Frame*. Lists the 7 Houses of the DragN with the strength scores for each.
![Leaders](https://dragnpuff.xyz/img/screen-leaderboard.png)
- *Seasonal Wars Leaderboard*. Shows the current season standings with time remaining and prize pools. Players can toggle between all-time and seasonal leaderboards.
- *Houses Frames*. Enable the players to flex/share their pledged House.
![House](https://dragnpuff.xyz/img/screen-choice.png)
- *Dragn x Pixel Frame*. A limited time frame and mini affiliate program that rewarded DragN mint referrals with Pixel Nouns NFTs on Degen chain.
![Pixel](https://dragnpuff.xyz/img/screen-pixel.png)
- *Breathed Fire Frame*. Players can flex/share when they "breathe fire" on another house (see cast action below)
![Fire](https://dragnpuff.xyz/img/screen-fire.png)
- *Quest Board Frame*. New Farcaster frame with animated quest board art, quick claim, and a direct link to the quests page.
- *Season Recap Frame*. Animated recap shareable with leaderboard link for wrapping a season and boosting casts.
- *Squad Status Frame*. Squad-ready shareable to refresh squad buffs and recruit via Warpcast compose links.

### Cast Actions
- *Breath Fire*. After installing this cast action, Farcaster users can use it on any cast of other players from opposing Houses, to "breathe fire" on the target house.

Action:
![Breathe](https://dragnpuff.xyz/img/screen-breath.png)

Result:
![Fired](https://dragnpuff.xyz/img/f.gif)

## Quest & Mission Engine
- **Daily quests**: "Breathe Fire" and "Flex Your House" auto-complete when you use the existing cast action or flex frame.
- **Weekly quest**: "Recruit Allies" increments on referral events (Pub/Sub) and tracks progress in Firestore.
- **Rewards**: XP and $NOM balances are stored offchain for now and claimable via the new endpoints.
- **API**: `GET /api/quests/:userId`, `POST /api/quests/:userId/progress`, `POST /api/quests/:userId/claim`.
- **Frontend**: The Firebase-hosted app now shows quest progress and claim buttons in the Quest panel.

## Seasonal House Wars
Time-bounded competitive seasons pit the 7 Houses against each other for glory and prizes:

- **Season Structure**: Each season runs for 30 days with a defined start and end time
- **Scoring System**: Houses earn points through player actions:
  - Breathe Fire: 15 points
  - Flex House: 5 points
  - Recruit Allies: 10 points
  - Cast Engagement: 3 points
- **Multipliers**: Dynamic multipliers (up to 5x) can be applied to Houses based on special events or achievements
- **Prize Pools**: ETH prize pools distributed to top 3 Houses (50% / 30% / 20% split)
- **Leaderboards**: 
  - All-time leaderboard tracks cumulative House strength
  - Seasonal leaderboard shows current season standings with real-time updates
  - Frame integration allows easy switching between views
- **Smart Contract**: `SeasonalWars.sol` tracks scores on-chain with event emissions for transparency
- **API Endpoints**: 
  - `GET /api/seasons/current` - Get active season info
  - `GET /api/seasons/:seasonId/leaderboard` - View season standings
  - `GET /api/seasons/:seasonId/house/:houseId` - House-specific stats
  - `POST /api/seasons/create` - Start new season (admin)
  - `POST /api/seasons/multiplier` - Update multipliers (admin)

## House Roles & Loadouts
Strategic role assignments for DragNs provide gameplay depth and player choice:

- **Role System**: Assign DragNs to specialized roles (Scout, Defender, Support) with unique modifiers
  - **Scout**: 1.5x attack, 0.8x defense - for aggressive strategies
  - **Defender**: 0.8x attack, 1.5x defense - for tank strategies
  - **Support**: 1.5x recruitment - for army building
- **Loadout Management**: Create battle loadouts with up to 5 DragNs per user
- **Modifiers**: Role-based action multipliers automatically apply to:
  - Breathe Fire attacks (Scout bonus applies)
  - Defense calculations (Defender bonus applies)
  - Recruitment (Support bonus applies)
- **Smart Contract**: `DragNRoles.sol` manages role assignments with EIP-712 signature support for gasless transactions
- **API Endpoints**:
  - `GET /api/roles/available` - List all available roles
  - `GET /api/roles/user/:address/loadout` - Get user's loadout
  - `GET /api/roles/user/:address/dragn/:tokenId` - Get DragN's role
  - `POST /api/roles/assign` - Assign role to DragN
  - `POST /api/roles/loadout/update` - Update user's loadout
  - `GET /api/roles/stats/:address` - Get user's role statistics
- **Frame**: Role assignment frame allows interactive role selection and loadout management
- **Documentation**: See [HOUSE_ROLES.md](docs/HOUSE_ROLES.md) for complete technical details

## DragN Infusions & Charm System
-## Referral & Squad Play
Recruit allies via frames and cast actions. Both referrer and referee receive buffs or loot upon successful, signed referral events.

- **Proofs**: Signed frame payloads verified and stored in Firestore
- **Buffs/Loot**: Granted to both parties and tracked on-chain/offchain roadmap
- **Squads**: Aggregated member lists, buffs, and loot for each referrer
- **API Endpoints**:
  - `POST /api/referrals/submit` — Submit referral proof
  - `GET /api/referrals/user/:fid` — User referral stats
  - `GET /api/referrals/squad/:referrerFid` — Squad view
  - `GET /api/referrals/leaderboard` — Top recruiters
  - `POST /api/referrals/redeem` — Redeem buffs/loot
- **Frame**: Recruit frame added to Firebase functions
- **Frontend**: Squad view component + referrals hook
- **Docs**: See [docs/REFERRALS_SQUADS.md](docs/REFERRALS_SQUADS.md)

## Achievements & Badges (Soulbound)
Non-transferable badges for milestones, displayed in profile and frames.

- **Contract**: Soulbound ERC721 at `contracts/DragNBadges.sol`
- **Milestones**: First Mint, 10 Fire Breaths, Season Top-10
- **API**:
  - `GET /api/badges/types`
  - `GET /api/badges/user/:address`
  - `POST /api/badges/award`
- **Frames**: `/api/frames/badges` basic view
- **Frontend**: `BadgesPanel` component + `useBadges` hook
- **Docs**: See [docs/ACHIEVEMENTS_BADGES.md](docs/ACHIEVEMENTS_BADGES.md)
Upgrade your DragNs with charms and trait modifications, creating repeatable sinks for $NOM tokens:

- **Charm System**: Attach cosmetic and gameplay charms to your DragNs
  - **5 Rarity Tiers**: Common (Tier 1) to Legendary (Tier 5) with scaling costs
  - **Dynamic Pricing**: Charm costs determined by rarity and ecosystem metrics
  - **Multiple Charms**: Apply multiple charms to a single DragN for stacked benefits
- **Trait Upgrades**: Permanently improve DragN attributes by spending $NOM
  - **Cost Multipliers**: 1x-5x cost scaling based on upgrade power
  - **Permanent Modifications**: Upgrades persist across seasons and gameplay
  - **Infusion Score**: Combined score from charms and upgrades determines visual ranking
- **Gasless Transactions**: EIP-712 signature support eliminates gas fees for users
- **Smart Contract**: `DragNInfusions.sol` manages charms and upgrades with replay protection
- **API Endpoints**:
  - `GET /api/infusions/charms` - List all available charms
  - `GET /api/infusions/dragn/:tokenId` - Get DragN's infusions
  - `GET /api/infusions/user/:address` - User's infusion stats
  - `GET /api/infusions/stats` - Global ecosystem stats
  - `GET /api/infusions/leaderboard` - Top spenders ranking
  - `POST /api/infusions/apply-charm` - Apply charm to DragN
  - `POST /api/infusions/upgrade-trait` - Upgrade a trait
- **Frame**: Interactive charm browsing and application flow
- **Leaderboard**: Track top spenders and most infused DragNs
- **Documentation**: See [DRAGN_INFUSIONS.md](docs/DRAGN_INFUSIONS.md) for complete technical details

# How it was built
All code for DragN'Puff and House of the DragNs was written duing the **Onchain Summer Buildathon** hackathon in June 2024. Artwork for the DragN'Puff NFT collection was mostly completed before the hackathon.

## Onchain - Contracts Deployed to Base
Two contracts were deployed to Base Mainnet during June 2024:

- `DragNPuff.sol` - ERC721 contract for the DragN'Puff NFT collection. Supports functions permission-gated functions `safeMint()` and `safeMintBatch()` and ERC721 votes to support future goverance voting. The contract is setup in a modular that relies on AccessControl to enabling minting via other contracts or trusted users. [#](https://basescan.org/address/0x5eCbc3931C78169cbF682C9b15602EB8f9A42387)
- `ERC721Minter.sol` - This contract was written as the primary minting interface, supporting two price points and a pre-sale mechanism. Open for 24 hours, the presale was available to holders of 100,000+ $NOM. Now in the opublic mint phase, minters pay different prices in ETH based on their $NOM holdings. [#](https://basescan.org/address/0x1dfA9A1afe793882229111Df790B09155EDF86e0)

The above structure was chosen for flexibility, as the minter contract can be replaced at any time, or a second minter contract could be added, possibly employing different mechanisms for minting (auctions, airdrops, token streaming, etc.)

## Server
Server-side elements include:

- *Firebase Functions*. Powering Farcaster frames, api endpoints, and rendering NFT metadata and images
- *Google Firestore*. Data store for gameplay scores and actions.
- *Google Cloud Storage*. Storage of high-resolution (4000px x 4000px) NFT images, thumbnails, and JSON metadata.

### 3rd Party APIs
The following were used by the Frame and Cast Action functions:

- *Airstack*. APIs for frame validation and querying for all of the DragNs owned by a speific Farcaster user.
- *Neynar*. APIs for get Farcaster user data, and to send casts of behalf of a bot user

# Summary and Stats (so far)
House of the DragNs is social gaming experience built on Base and Farcaster. Gameplay happens via frames and other social interactions (cast actions, casts, reactions). Social sharing is facilitated and encouraged: launched only 2 weeks ago, almost 20,000 frames have been shared to date, attracting 20,000 likes, 13,000 replies, and 12,000 recasts (see Airstack Frame Analytics image attached to this submission). Beginning imminently, a campaign to attract players from other social networks will aim to use the NFT collection as a stepping stone to pull more users into the Farcaster social ecosystem, where the gameplay happens.
![Airstack](https://dragnpuff.xyz/img/screen-airstack.png)

# Team

The Houses of the DragN team consists of [nomadicframe](https://warpcast.com/nomadicframe), [markcarey](https://warpcast.com/markcarey), [milibooo](https://warpcast.com/milibooo), and [midnite-marauder](https://warpcast.com/midnite-marauder)





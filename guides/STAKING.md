# Token Staking Guide

## Overview

Stake your FAIR tokens to earn rewards and governance rights.

## Staking Benefits

- 🎁 Earn staking rewards (8-12% APY)
- 🗳️ Voting rights in DAO
- 🎟️ NFT minting discounts (holder fees)
- 🏆 Leaderboard ranking
- 💰 Yield farming opportunities

## Getting Started

### Step 1: Acquire FAIR Tokens

```bash
# Check your balance
npm run read-state

# Look for: FairToken Balance
```

### Step 2: Approve Staking

```javascript
const fairToken = await ethers.getContractAt("FairToken", FAIR_ADDRESS);
const stakingContract = "0x..."; // Staking contract address

const amount = ethers.parseEther("1000"); // 1000 FAIR
await fairToken.approve(stakingContract, amount);
```

### Step 3: Stake Tokens

```javascript
const staking = await ethers.getContractAt("Staking", STAKING_ADDRESS);
const amount = ethers.parseEther("1000");

const tx = await staking.stake(amount);
await tx.wait();

console.log("✅ Staked 1000 FAIR");
```

## Staking Tiers

| Tier | Amount | APY | Benefits |
|------|--------|-----|----------|
| Bronze | 100+ | 8% | Basic rewards |
| Silver | 1,000+ | 10% | + Governance vote |
| Gold | 10,000+ | 12% | + Minting discount |
| Platinum | 100,000+ | 15% | + Exclusive perks |

## Claim Rewards

```javascript
const staking = await ethers.getContractAt("Staking", STAKING_ADDRESS);

// Check pending rewards
const pending = await staking.pendingRewards(yourAddress);
console.log(`Rewards: ${ethers.formatEther(pending)} FAIR`);

// Claim rewards
const tx = await staking.claimRewards();
await tx.wait();
```

## Unstaking

```javascript
const amount = ethers.parseEther("1000");

const tx = await staking.unstake(amount);
await tx.wait();

// Cooldown period: 7 days before withdrawing
// Rewards are forfeited if unstake early
```

## Rewards Calculator

```javascript
function calculateAPY(amount, apy) {
  const dailyReward = (amount * (apy / 100)) / 365;
  const monthlyReward = dailyReward * 30;
  const yearlyReward = amount * (apy / 100);
  
  return {
    daily: ethers.formatEther(dailyReward),
    monthly: ethers.formatEther(monthlyReward),
    yearly: ethers.formatEther(yearlyReward),
  };
}

const tier = calculateAPY(
  ethers.parseEther("1000"),
  10 // 10% APY for Silver tier
);

console.log(`Daily: ${tier.daily} FAIR`);
console.log(`Monthly: ${tier.monthly} FAIR`);
console.log(`Yearly: ${tier.yearly} FAIR`);
```

## Compounding Rewards

Auto-compound your rewards:

```javascript
async function autoCompound() {
  const staking = await ethers.getContractAt("Staking", STAKING_ADDRESS);
  
  const pending = await staking.pendingRewards(yourAddress);
  
  if (pending > 0) {
    // Claim rewards
    await staking.claimRewards();
    
    // Re-stake immediately
    await fairToken.approve(STAKING_ADDRESS, pending);
    await staking.stake(pending);
    
    console.log("✅ Compounded rewards");
  }
}
```

## Tax & Gas Costs

- **Staking fee:** 0 FAIR
- **Unstaking fee:** 0 FAIR
- **Gas cost (stake):** ~0.001 ETH
- **Gas cost (unstake):** ~0.001 ETH
- **Gas cost (claim):** ~0.0008 ETH

## Governance

As a staker, you can vote on proposals:

```javascript
const governance = await ethers.getContractAt("Governance", GOV_ADDRESS);

// View proposals
const proposal = await governance.proposals(proposalId);
console.log("Proposal:", proposal.description);

// Vote (requires min stake)
await governance.vote(proposalId, 1); // 1 = yes, 0 = no

// Check voting power
const power = await governance.getVotingPower(yourAddress);
console.log(`Voting Power: ${power} votes`);
```

## FAQ

**Q: Can I unstake anytime?**
A: Yes, but there's a 7-day cooldown and early unstaking forfeits rewards.

**Q: When are rewards paid?**
A: Rewards accrue continuously and can be claimed anytime.

**Q: What happens if I transfer tokens while staking?**
A: You can't transfer staked tokens. Must unstake first.

**Q: How are rewards funded?**
A: From protocol fees and treasury allocation.

## See Also

- [Farming Guide](./FARMING.md)
- [Governance](./GOVERNANCE.md)
- [DeFi Strategy](./DEFI_STRATEGY.md)

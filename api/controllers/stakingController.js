/**
 * Staking Controller
 * Handles staking operations and rewards
 */

const { asyncHandler } = require('../middleware/errorHandler');
const StakingPosition = require('../models/Staking');

const getStakingInfo = asyncHandler(async (req, res) => {
  // TODO: wire to on-chain staking contract and cache
  const info = {
    totalStaked: 0,
    totalRewards: 0,
    apyRange: { min: 8, max: 15 },
    stakedTokens: 0,
    holders: 0,
    lastUpdated: new Date()
  };

  return info;
});

const getUserStaking = asyncHandler(async (req, res) => {
  const { address } = req.params;
  const position = await StakingPosition.findByUser(address);
  return position.toJSON();
});

const getUserRewards = asyncHandler(async (req, res) => {
  const { address } = req.params;
  const position = await StakingPosition.findByUser(address);
  const pendingRewards = position.calculatePendingRewards();

  return {
    address,
    pendingRewards,
    claimedRewards: position.rewardsEarned,
    totalRewards: position.rewardsEarned + pendingRewards
  };
});

const stake = asyncHandler(async (req, res) => {
  const { amount, lockPeriod = 30, houseId = 0 } = req.body;
  const address = req.user.address;

  const position = await StakingPosition.create(address, amount, lockPeriod * 24 * 60 * 60 * 1000, houseId);

  return {
    position: position.toJSON(),
    message: `Successfully staked ${amount} tokens for house ${houseId}`
  };
});

const unstake = asyncHandler(async (req, res) => {
  const address = req.user.address;
  const position = await StakingPosition.findByUser(address);

  if (!position || position.amount === 0) {
    throw new Error('No staking position found');
  }

  await position.unstake();
  return { message: 'Unstaking initiated successfully' };
});

const claimRewards = asyncHandler(async (req, res) => {
  const address = req.user.address;
  const position = await StakingPosition.findByUser(address);

  const rewards = await position.claim();

  return {
    claimedAmount: rewards,
    totalClaimed: position.rewardsEarned,
    message: `Claimed ${rewards} tokens in rewards`
  };
});

const getStakingRate = asyncHandler(async (req, res) => {
  const { amount, lockPeriod = 30 } = req.query;
  const apy = StakingPosition.getAPY(amount ? parseInt(amount) : 0, lockPeriod ? parseInt(lockPeriod) : 30);
  return { apy, amount, lockPeriod };
});

const getLeaderboard = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const leaderboard = [];
  return {
    leaderboard,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit)
    }
  };
});

module.exports = {
  getStakingInfo,
  getUserStaking,
  getUserRewards,
  stake,
  unstake,
  claimRewards,
  getStakingRate,
  getLeaderboard
};

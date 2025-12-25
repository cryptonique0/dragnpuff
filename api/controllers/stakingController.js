/**
 * Staking Controller
 * Handles staking operations and rewards
 */

const { asyncHandler } = require('../middleware/errorHandler');
const StakingPosition = require('../models/Staking');

const getStakingInfo = asyncHandler(async (req, res) => {
  const info = {
    totalStaked: 5000000,
    totalRewards: 250000,
    apyRange: { min: 8, max: 15 },
    stakedTokens: 45000,
    holders: 1250,
    lastUpdated: new Date()
  };

  res.json({
    success: true,
    data: info
  });
});

const getUserStaking = asyncHandler(async (req, res) => {
  const { address } = req.params;
  const position = await StakingPosition.findByUser(address);

  res.json({
    success: true,
    data: position.toJSON()
  });
});

const getUserRewards = asyncHandler(async (req, res) => {
  const { address } = req.params;
  const position = await StakingPosition.findByUser(address);
  const pendingRewards = position.calculatePendingRewards();

  res.json({
    success: true,
    data: {
      address,
      pendingRewards,
      claimedRewards: position.rewardsEarned,
      totalRewards: position.rewardsEarned + pendingRewards
    }
  });
});

const stake = asyncHandler(async (req, res) => {
  const { amount, lockPeriod = 30 } = req.body;
  const address = req.user.address;

  // TODO: Process token transfer
  const position = await StakingPosition.create(address, amount, lockPeriod * 24 * 60 * 60 * 1000);

  res.status(201).json({
    success: true,
    data: position.toJSON(),
    message: `Successfully staked ${amount} tokens`
  });
});

const unstake = asyncHandler(async (req, res) => {
  const address = req.user.address;
  const position = await StakingPosition.findByUser(address);

  if (!position || position.amount === 0) {
    return res.status(400).json({
      success: false,
      message: 'No staking position found'
    });
  }

  try {
    await position.unstake();
    res.json({
      success: true,
      message: 'Unstaking initiated successfully'
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

const claimRewards = asyncHandler(async (req, res) => {
  const address = req.user.address;
  const position = await StakingPosition.findByUser(address);

  const rewards = await position.claim();

  res.json({
    success: true,
    data: {
      claimedAmount: rewards,
      totalClaimed: position.rewardsEarned
    },
    message: `Claimed ${rewards} tokens in rewards`
  });
});

const getStakingRate = asyncHandler(async (req, res) => {
  const { amount } = req.query;
  
  const apy = StakingPosition.getAPY(amount ? parseInt(amount) : 0);

  res.json({
    success: true,
    data: { apy, amount }
  });
});

const getLeaderboard = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;

  // TODO: Fetch from database
  const leaderboard = [];

  res.json({
    success: true,
    data: leaderboard,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit)
    }
  });
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

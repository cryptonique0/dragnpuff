/**
 * Staking Routes
 */

const express = require("express");
const router = express.Router();
const stakingController = require("../controllers/staking.controller");

/**
 * Get staking info
 */
router.get("/info", async (req, res) => {
  try {
    const info = await stakingController.getStakingInfo();
    res.json({ success: true, data: info });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Get user stake
 */
router.get("/user/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const stake = await stakingController.getUserStake(address);
    res.json({ success: true, data: stake });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Get pending rewards
 */
router.get("/rewards/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const rewards = await stakingController.getPendingRewards(address);
    res.json({ success: true, data: rewards });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Stake tokens
 */
router.post("/stake", async (req, res) => {
  try {
    const { staker, amount } = req.body;
    const result = await stakingController.stake(staker, amount);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Unstake tokens
 */
router.post("/unstake", async (req, res) => {
  try {
    const { staker, amount } = req.body;
    const result = await stakingController.unstake(staker, amount);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Claim rewards
 */
router.post("/claim", async (req, res) => {
  try {
    const { staker } = req.body;
    const result = await stakingController.claimRewards(staker);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Get reward rate
 */
router.get("/rate", async (req, res) => {
  try {
    const rate = await stakingController.getRewardRate();
    res.json({ success: true, data: { rate } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Get staking leaderboard
 */
router.get("/leaderboard", async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const leaderboard = await stakingController.getLeaderboard(limit);
    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;

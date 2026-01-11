/**
 * User Routes
 */

const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

/**
 * Get user profile
 */
router.get("/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const user = await userController.getUserProfile(address);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Update user profile
 */
router.put("/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const { username, bio, avatar } = req.body;
    const user = await userController.updateUserProfile(address, {
      username,
      bio,
      avatar,
    });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Get user portfolio
 */
router.get("/:address/portfolio", async (req, res) => {
  try {
    const { address } = req.params;
    const portfolio = await userController.getUserPortfolio(address);
    res.json({ success: true, data: portfolio });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Get user transactions
 */
router.get("/:address/transactions", async (req, res) => {
  try {
    const { address } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const transactions = await userController.getUserTransactions(
      address,
      page,
      limit
    );
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Get user stats
 */
router.get("/:address/stats", async (req, res) => {
  try {
    const { address } = req.params;
    const stats = await userController.getUserStats(address);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Get user NFTs
 */
router.get("/:address/nfts", async (req, res) => {
  try {
    const { address } = req.params;
    const nfts = await userController.getUserNFTs(address);
    res.json({ success: true, data: nfts });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Get user activity
 */
router.get("/:address/activity", async (req, res) => {
  try {
    const { address } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const activity = await userController.getUserActivity(
      address,
      page,
      limit
    );
    res.json({ success: true, data: activity });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Follow user
 */
router.post("/:address/follow", async (req, res) => {
  try {
    const { address } = req.params;
    const { follower } = req.body;
    const result = await userController.followUser(address, follower);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;

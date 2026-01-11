const express = require("express");
const router = express.Router();
const seasonController = require("../controllers/seasonController");

/**
 * Seasonal Wars Routes
 */

// Get current active season
router.get("/current", seasonController.getCurrentSeason);

// Get season leaderboard
router.get("/:seasonId/leaderboard", seasonController.getSeasonLeaderboard);

// Get house statistics for a season
router.get("/:seasonId/house/:houseId", seasonController.getHouseStats);

// Create new season (admin only)
router.post("/create", seasonController.createSeason);

// Update multiplier (admin only)
router.post("/multiplier", seasonController.updateMultiplier);

module.exports = router;

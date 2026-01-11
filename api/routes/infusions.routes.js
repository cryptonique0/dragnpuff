const express = require('express');
const router = express.Router();
const InfusionsController = require('../controllers/infusionsController');

/**
 * GET /api/infusions/charms
 * Get all available charms
 */
router.get('/charms', InfusionsController.getAvailableCharms);

/**
 * GET /api/infusions/dragn/:tokenId
 * Get infusion data for a specific DragN
 */
router.get('/dragn/:tokenId', InfusionsController.getDragNInfusions);

/**
 * GET /api/infusions/user/:address
 * Get user's infusion statistics
 */
router.get('/user/:address', InfusionsController.getUserInfusionStats);

/**
 * POST /api/infusions/apply-charm
 * Apply a charm to a DragN
 */
router.post('/apply-charm', InfusionsController.applyCharm);

/**
 * POST /api/infusions/upgrade-trait
 * Upgrade a trait on a DragN
 */
router.post('/upgrade-trait', InfusionsController.upgradeTrait);

/**
 * GET /api/infusions/stats
 * Get global infusion statistics
 */
router.get('/stats', InfusionsController.getGlobalStats);

/**
 * GET /api/infusions/leaderboard
 * Get top spenders leaderboard
 */
router.get('/leaderboard', InfusionsController.getLeaderboard);

module.exports = router;

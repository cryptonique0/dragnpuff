const express = require('express');
const router = express.Router();
const ReferralsController = require('../controllers/referralsController');

// Submit referral proof (signed frame payload)
router.post('/submit', ReferralsController.submitReferral);

// Get referral stats for user
router.get('/user/:fid', ReferralsController.getUserReferrals);

// Get squad view for a referrer
router.get('/squad/:referrerFid', ReferralsController.getSquad);

// Leaderboard of recruiters
router.get('/leaderboard', ReferralsController.getLeaderboard);

// Redeem buffs/loot
router.post('/redeem', ReferralsController.redeem);

module.exports = router;

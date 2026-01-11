const express = require('express');
const router = express.Router();
const BadgesController = require('../controllers/badgesController');

router.get('/types', BadgesController.getTypes);
router.get('/user/:address', BadgesController.getUserBadges);
router.post('/award', BadgesController.award);

module.exports = router;

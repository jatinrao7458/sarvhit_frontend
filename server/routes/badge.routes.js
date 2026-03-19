const express = require('express');
const badgeController = require('../controllers/badge.controller');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get user badges
router.get('/', authMiddleware, badgeController.getBadges);

// Get all badge types
router.get('/all', badgeController.getAllBadges);

// Award badge (admin only)
router.post('/award', authMiddleware, badgeController.awardBadge);

module.exports = router;

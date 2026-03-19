const express = require('express');
const leaderboardController = require('../controllers/leaderboard.controller');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get leaderboard
router.get('/', leaderboardController.getLeaderboard);

// Get user stats
router.get('/stats', authMiddleware, leaderboardController.getUserStats);

module.exports = router;

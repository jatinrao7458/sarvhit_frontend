const express = require('express');
const discoverController = require('../controllers/discover.controller');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Discover users (with cross-role visibility)
router.get('/users', authMiddleware, discoverController.discoverAccessibleUsers);

// Discover users by specific type (public endpoint)
router.get('/users/by-type/:type', discoverController.discoverUsers);

// Get user profile
router.get('/profile/:userId', discoverController.getUserProfile);

// Update user profile
router.put('/profile', authMiddleware, discoverController.updateUserProfile);

module.exports = router;

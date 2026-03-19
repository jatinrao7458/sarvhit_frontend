const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get dashboard data
router.get('/', authMiddleware, dashboardController.getDashboardData);

// Get social feed
router.get('/feed', dashboardController.getSocialFeed);

module.exports = router;

const express = require('express');
const notificationController = require('../controllers/notification.controller');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All notification routes require authentication
router.get('/', authMiddleware, notificationController.getNotifications);
router.get('/unread-count', authMiddleware, notificationController.getUnreadCount);
router.patch('/:id/read', authMiddleware, notificationController.markAsRead);

module.exports = router;

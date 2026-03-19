const express = require('express');
const messageController = require('../controllers/message.controller');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all conversations
router.get('/', authMiddleware, messageController.getConversations);

// Start conversation
router.post('/start', authMiddleware, messageController.startConversation);

// Get conversation messages
router.get('/:conversationId', authMiddleware, messageController.getConversationMessages);

// Send message
router.post('/:conversationId/send', authMiddleware, messageController.sendMessage);

module.exports = router;

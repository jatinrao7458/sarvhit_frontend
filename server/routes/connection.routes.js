const express = require('express');
const connectionController = require('../controllers/connection.controller');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Send connection request
router.post('/request', authMiddleware, connectionController.sendConnectionRequest);

// Accept connection
router.patch('/:connectionId/accept', authMiddleware, connectionController.acceptConnection);

// Get connections
router.get('/', authMiddleware, connectionController.getConnections);

// Get pending requests
router.get('/pending', authMiddleware, connectionController.getPendingRequests);

// Block connection
router.patch('/:connectionId/block', authMiddleware, connectionController.blockConnection);

module.exports = router;

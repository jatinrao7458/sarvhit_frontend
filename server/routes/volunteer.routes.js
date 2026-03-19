const express = require('express');
const volunteerController = require('../controllers/volunteer.controller');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all volunteers (for map display)
router.get('/all', volunteerController.getAllVolunteers);

// Log volunteer hours
router.post('/log-hours', authMiddleware, volunteerController.logVolunteerHours);

// Get volunteer logs
router.get('/my-logs', authMiddleware, volunteerController.getVolunteerLogs);

// Get pending logs (for NGO to approve)
router.get('/pending', authMiddleware, volunteerController.getPendingVolunteerLogs);

// Approve volunteer hours
router.patch('/:logId/approve', authMiddleware, volunteerController.approveVolunteerHours);

// Reject volunteer hours
router.patch('/:logId/reject', authMiddleware, volunteerController.rejectVolunteerHours);

module.exports = router;

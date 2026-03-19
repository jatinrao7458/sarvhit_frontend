const express = require('express');
const eventController = require('../controllers/event.controller');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Protected routes (require authentication) - Place before :id routes
router.post('/', authMiddleware, eventController.createEvent);
router.get('/organizer/my-events', authMiddleware, eventController.getOrganizerEvents);

// Public routes (accessible without authentication)
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);

// Protected routes with ID - Place after non-ID routes
router.put('/:id', authMiddleware, eventController.updateEvent);
router.delete('/:id', authMiddleware, eventController.deleteEvent);
router.patch('/:id/publish', authMiddleware, eventController.publishEvent);

// Volunteer routes
router.post('/:eventId/join', authMiddleware, eventController.joinEventAsVolunteer);

// Volunteer approval routes (NGO only)
router.patch('/:eventId/volunteers/:volunteerId/approve', authMiddleware, eventController.approveVolunteer);
router.patch('/:eventId/volunteers/:volunteerId/reject', authMiddleware, eventController.rejectVolunteer);

// Sponsor routes
router.post('/:eventId/fund', authMiddleware, eventController.fundEvent);

module.exports = router;

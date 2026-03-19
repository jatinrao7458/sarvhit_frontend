const Event = require('../models/Event');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Create a new event (NGO only)
exports.createEvent = async (req, res) => {
  try {
    const {
      title, cause, date, time, location, description, purpose,
      societyImpact, volunteerRole, image, orgName, spots,
      fundGoal, highlights, impactStats
    } = req.body;

    // Validate required fields
    if (!title || !cause || !date || !time || !location || !description || !orgName || !spots) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    const event = new Event({
      title,
      cause,
      date,
      time,
      location,
      description,
      purpose: purpose || '',
      societyImpact: societyImpact || '',
      volunteerRole: volunteerRole || '',
      image: image || '🎯',
      orgName,
      organizerId: req.user.userId,
      spots,
      fundGoal: fundGoal || 0,
      highlights: highlights || [],
      impactStats: impactStats || [],
      status: 'upcoming',
      isPublished: true // Explicitly publish immediately upon creation
    });

    console.log('Creating event:', { title, isPublished: true, organizerId: req.user.userId });
    const savedEvent = await event.save();
    console.log('Event saved successfully:', savedEvent._id, savedEvent.isPublished);
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: savedEvent
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating event',
      error: error.message
    });
  }
};

// Get all published events (for general users)
exports.getAllEvents = async (req, res) => {
  try {
    const { cause, status, sort } = req.query;
    
    let query = { isPublished: true };

    if (cause) {
      query.cause = cause;
    }

    if (status) {
      query.status = status;
    }

    let queryBuilder = Event.find(query)
      .populate('organizerId', 'firstName lastName email phone')
      .populate('volunteers.volunteerId', 'firstName lastName email')
      .populate('sponsors.sponsorId', 'firstName lastName email');

    // Apply default sorting - newest first
    if (sort === 'newest') {
      queryBuilder = queryBuilder.sort({ createdAt: -1 });
    } else if (sort === 'oldest') {
      queryBuilder = queryBuilder.sort({ createdAt: 1 });
    } else if (sort === 'most-funded') {
      queryBuilder = queryBuilder.sort({ fundRaised: -1 });
    } else if (sort === 'most-volunteers') {
      queryBuilder = queryBuilder.sort({ filled: -1 });
    } else {
      // Default: sort by newest first
      queryBuilder = queryBuilder.sort({ createdAt: -1 });
    }

    const allEvents = await queryBuilder.lean();

    res.json({
      success: true,
      count: allEvents.length,
      events: allEvents
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message
    });
  }
};

// Get single event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizerId', 'firstName lastName email phone bio')
      .populate('volunteers.volunteerId', 'firstName lastName email')
      .populate('sponsors.sponsorId', 'firstName lastName email');

    if (!event || !event.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event',
      error: error.message
    });
  }
};

// Update event (NGO owner only)
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is the event organizer
    if (event.organizerId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this event'
      });
    }

    // Update allowed fields
    const updateFields = [
      'title', 'cause', 'date', 'time', 'location', 'description',
      'purpose', 'societyImpact', 'volunteerRole', 'image', 'status',
      'spots', 'filled', 'fundGoal', 'fundRaised', 'highlights', 'impactStats'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    event.updatedAt = new Date();
    const updatedEvent = await event.save();

    res.json({
      success: true,
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating event',
      error: error.message
    });
  }
};

// Delete event (NGO owner only)
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is the event organizer
    if (event.organizerId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this event'
      });
    }

    await Event.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting event',
      error: error.message
    });
  }
};

// Get events by organizer (NGO)
exports.getOrganizerEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizerId: req.user.userId })
      .populate('volunteers', 'firstName lastName email')
      .populate('sponsors', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Error fetching organizer events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message
    });
  }
};

// Join event as volunteer (creates a PENDING request + notifies the NGO)
exports.joinEventAsVolunteer = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if spots are available
    if (event.filled >= event.spots) {
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      });
    }

    // Check if already joined or pending
    const existing = event.volunteers.find(
      (v) => v.volunteerId.toString() === req.user.userId.toString()
    );
    if (existing) {
      return res.status(400).json({
        success: false,
        message: existing.status === 'pending'
          ? 'Your join request is already pending approval'
          : 'You are already a volunteer for this event'
      });
    }

    // Add volunteer with PENDING status
    event.volunteers.push({
      volunteerId: req.user.userId,
      status: 'pending',
      joinedAt: new Date(),
    });
    // Do NOT increment filled — only on approval
    await event.save();

    // Create notification for the NGO organizer
    const volunteer = await User.findById(req.user.userId).select('firstName lastName');
    await Notification.create({
      recipientId: event.organizerId,
      senderId: req.user.userId,
      type: 'join_request',
      eventId: event._id,
      message: `${volunteer.firstName} ${volunteer.lastName} wants to join "${event.title}"`,
      status: 'unread'
    });

    await event.populate('volunteers.volunteerId', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Join request sent! Waiting for NGO approval.',
      event
    });
  } catch (error) {
    console.error('Error joining event:', error);
    res.status(500).json({
      success: false,
      message: 'Error joining event',
      error: error.message
    });
  }
};

// Approve a volunteer (NGO owner only)
exports.approveVolunteer = async (req, res) => {
  try {
    const { eventId, volunteerId } = req.params;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Only the organizer can approve
    if (event.organizerId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const volunteer = event.volunteers.find(
      (v) => v.volunteerId.toString() === volunteerId
    );

    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found in this event' });
    }

    if (volunteer.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Volunteer is not in pending status' });
    }

    // Check if spots are still available
    if (event.filled >= event.spots) {
      return res.status(400).json({ success: false, message: 'Event is full, cannot approve' });
    }

    // Approve: set status to joined and increment filled
    volunteer.status = 'joined';
    event.filled += 1;
    await event.save();

    // Mark the original join_request notification as actioned
    await Notification.updateMany(
      {
        recipientId: req.user.userId,
        senderId: volunteerId,
        eventId: event._id,
        type: 'join_request',
        status: { $ne: 'actioned' }
      },
      { status: 'actioned' }
    );

    // Create approval notification for the volunteer
    const ngoUser = await User.findById(req.user.userId).select('firstName lastName');
    await Notification.create({
      recipientId: volunteerId,
      senderId: req.user.userId,
      type: 'join_approved',
      eventId: event._id,
      message: `${ngoUser.firstName} ${ngoUser.lastName} approved your request to join "${event.title}"`,
      status: 'unread'
    });

    await event.populate('volunteers.volunteerId', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Volunteer approved successfully',
      event
    });
  } catch (error) {
    console.error('Error approving volunteer:', error);
    res.status(500).json({ success: false, message: 'Error approving volunteer', error: error.message });
  }
};

// Reject a volunteer (NGO owner only)
exports.rejectVolunteer = async (req, res) => {
  try {
    const { eventId, volunteerId } = req.params;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Only the organizer can reject
    if (event.organizerId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const volunteerIndex = event.volunteers.findIndex(
      (v) => v.volunteerId.toString() === volunteerId
    );

    if (volunteerIndex === -1) {
      return res.status(404).json({ success: false, message: 'Volunteer not found in this event' });
    }

    // Remove the volunteer from the array
    event.volunteers.splice(volunteerIndex, 1);
    await event.save();

    // Mark the original join_request notification as actioned
    await Notification.updateMany(
      {
        recipientId: req.user.userId,
        senderId: volunteerId,
        eventId: event._id,
        type: 'join_request',
        status: { $ne: 'actioned' }
      },
      { status: 'actioned' }
    );

    // Create rejection notification for the volunteer
    const ngoUser = await User.findById(req.user.userId).select('firstName lastName');
    await Notification.create({
      recipientId: volunteerId,
      senderId: req.user.userId,
      type: 'join_rejected',
      eventId: event._id,
      message: `${ngoUser.firstName} ${ngoUser.lastName} declined your request to join "${event.title}"`,
      status: 'unread'
    });

    res.json({
      success: true,
      message: 'Volunteer rejected'
    });
  } catch (error) {
    console.error('Error rejecting volunteer:', error);
    res.status(500).json({ success: false, message: 'Error rejecting volunteer', error: error.message });
  }
};


// Fund event as sponsor
exports.fundEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { amount } = req.body;
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount'
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    event.fundRaised += numericAmount;
    
    // Check if sponsor already exists
    const existingSponsor = event.sponsors.find(
      (s) => s.sponsorId.toString() === req.user.userId.toString()
    );

    if (existingSponsor) {
      // Update existing sponsor amount
      existingSponsor.amount += numericAmount;
    } else {
      // Add new sponsor
      event.sponsors.push({
        sponsorId: req.user.userId,
        amount: numericAmount,
        fundedAt: new Date(),
      });
    }

    await event.save();
    await event.populate('sponsors.sponsorId', 'firstName lastName email');

    res.json({
      success: true,
      message: `Funded ₹${numericAmount} successfully`,
      event
    });
  } catch (error) {
    console.error('Error funding event:', error);
    res.status(500).json({
      success: false,
      message: 'Error funding event',
      error: error.message
    });
  }
};

// Publish event (for drafts)
exports.publishEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is the event organizer
    if (event.organizerId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to publish this event'
      });
    }

    event.isPublished = true;
    const publishedEvent = await event.save();

    res.json({
      success: true,
      message: 'Event published successfully',
      event: publishedEvent
    });
  } catch (error) {
    console.error('Error publishing event:', error);
    res.status(500).json({
      success: false,
      message: 'Error publishing event',
      error: error.message
    });
  }
};

const Event = require('../models/Event');

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
      organizerId: req.user._id,
      spots,
      fundGoal: fundGoal || 0,
      highlights: highlights || [],
      impactStats: impactStats || [],
      isPublished: true // Published immediately upon creation
    });

    const savedEvent = await event.save();
    
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

    let events = Event.find(query)
      .populate('organizerId', 'firstName lastName email phone')
      .populate('volunteers.volunteerId', 'firstName lastName email')
      .populate('sponsors.sponsorId', 'firstName lastName email');

    // Sorting options
    if (sort === 'newest') {
      events = events.sort({ createdAt: -1 });
    } else if (sort === 'oldest') {
      events = events.sort({ createdAt: 1 });
    } else if (sort === 'most-funded') {
      events = events.sort({ fundRaised: -1 });
    } else if (sort === 'most-volunteers') {
      events = events.sort({ filled: -1 });
    }

    const allEvents = await events;

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
    if (event.organizerId.toString() !== req.user._id.toString()) {
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
    if (event.organizerId.toString() !== req.user._id.toString()) {
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
    const events = await Event.find({ organizerId: req.user._id })
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

// Join event as volunteer
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

    // Check if already joined
    const alreadyJoined = event.volunteers.some(
      (v) => v.volunteerId.toString() === req.user._id.toString()
    );
    if (alreadyJoined) {
      return res.status(400).json({
        success: false,
        message: 'You are already a volunteer for this event'
      });
    }

    event.volunteers.push({
      volunteerId: req.user._id,
      status: 'joined',
      joinedAt: new Date(),
    });
    event.filled += 1;
    await event.save();
    await event.populate('volunteers.volunteerId', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Successfully joined event as volunteer',
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

// Fund event as sponsor
exports.fundEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
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

    event.fundRaised += amount;
    
    // Check if sponsor already exists
    const existingSponsor = event.sponsors.find(
      (s) => s.sponsorId.toString() === req.user._id.toString()
    );

    if (existingSponsor) {
      // Update existing sponsor amount
      existingSponsor.amount += amount;
    } else {
      // Add new sponsor
      event.sponsors.push({
        sponsorId: req.user._id,
        amount: amount,
        fundedAt: new Date(),
      });
    }

    await event.save();
    await event.populate('sponsors.sponsorId', 'firstName lastName email');

    res.json({
      success: true,
      message: `Funded ₹${amount} successfully`,
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
    if (event.organizerId.toString() !== req.user._id.toString()) {
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

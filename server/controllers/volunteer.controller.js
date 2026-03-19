const VolunteerLog = require('../models/VolunteerLog');
const Event = require('../models/Event');
const Badge = require('../models/Badge');

exports.logVolunteerHours = async (req, res) => {
  try {
    const { eventId, hoursLogged, roleFilledAt, description } = req.body;
    const volunteerId = req.user.userId;

    if (!eventId || !hoursLogged) {
      return res.status(400).json({
        success: false,
        message: 'Event ID and hours are required',
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const log = new VolunteerLog({
      volunteerId,
      eventId,
      hoursLogged,
      roleFilledAt: roleFilledAt || '',
      description: description || '',
      status: 'pending',
    });

    await log.save();

    res.status(201).json({
      success: true,
      message: 'Volunteer hours submitted for approval',
      log,
    });
  } catch (error) {
    console.error('Error logging volunteer hours:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging volunteer hours',
      error: error.message,
    });
  }
};

exports.getVolunteerLogs = async (req, res) => {
  try {
    const volunteerId = req.user.userId;

    const logs = await VolunteerLog.find({ volunteerId })
      .populate('eventId', 'title date location')
      .sort({ loggedAt: -1 });

    const totalHours = logs
      .filter((log) => log.status === 'approved')
      .reduce((sum, log) => sum + log.hoursLogged, 0);

    res.json({
      success: true,
      logs,
      totalHours,
    });
  } catch (error) {
    console.error('Error fetching volunteer logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching volunteer logs',
      error: error.message,
    });
  }
};

exports.approveVolunteerHours = async (req, res) => {
  try {
    const { logId } = req.params;

    const log = await VolunteerLog.findByIdAndUpdate(
      logId,
      { status: 'approved' },
      { new: true }
    );

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Log not found',
      });
    }

    // Check if volunteer earned a badge
    const totalApprovedHours = await VolunteerLog.aggregate([
      {
        $match: {
          volunteerId: log.volunteerId,
          status: 'approved',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$hoursLogged' },
        },
      },
    ]);

    const hours = totalApprovedHours[0]?.total || 0;

    // Award badges for milestones
    if (hours === 50) {
      const existingBadge = await Badge.findOne({
        userId: log.volunteerId,
        badgeName: 'First Responder',
      });

      if (!existingBadge) {
        await Badge.create({
          userId: log.volunteerId,
          badgeName: 'First Responder',
          description: 'Completed 50 volunteer hours',
          criteria: '50 hours',
        });
      }
    }

    if (hours === 100) {
      const existingBadge = await Badge.findOne({
        userId: log.volunteerId,
        badgeName: 'Volunteer Master',
      });

      if (!existingBadge) {
        await Badge.create({
          userId: log.volunteerId,
          badgeName: 'Volunteer Master',
          description: 'Completed 100 volunteer hours',
          criteria: '100 hours',
        });
      }
    }

    res.json({
      success: true,
      message: 'Hours approved',
      log,
    });
  } catch (error) {
    console.error('Error approving volunteer hours:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving volunteer hours',
      error: error.message,
    });
  }
};

exports.rejectVolunteerHours = async (req, res) => {
  try {
    const { logId } = req.params;

    const log = await VolunteerLog.findByIdAndUpdate(
      logId,
      { status: 'rejected' },
      { new: true }
    );

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Log not found',
      });
    }

    res.json({
      success: true,
      message: 'Hours rejected',
      log,
    });
  } catch (error) {
    console.error('Error rejecting volunteer hours:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting volunteer hours',
      error: error.message,
    });
  }
};

exports.getPendingVolunteerLogs = async (req, res) => {
  try {
    const logs = await VolunteerLog.find({ status: 'pending' })
      .populate('volunteerId', 'firstName lastName email')
      .populate('eventId', 'title date location')
      .sort({ loggedAt: -1 });

    res.json({
      success: true,
      logs,
    });
  } catch (error) {
    console.error('Error fetching pending logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending logs',
      error: error.message,
    });
  }
};

// Get all active volunteers for map display
exports.getAllVolunteers = async (req, res) => {
  try {
    const Volunteer = require('../models/Volunteer');
    
    // Fetch all active volunteers from Volunteer collection
    // Populate user details
    const volunteers = await Volunteer.find({ isActive: true })
      .populate('userId', 'email phone')
      .select('firstName lastName email city state profileImage bio focusAreas volunteerHours isVerified')
      .sort({ createdAt: -1 })
      .limit(100);

    // Add default coordinates for map display
    // In future, this can be replaced with geocoding from address
    const volunteersWithCoords = volunteers.map((vol, idx) => ({
      id: vol._id,
      name: `${vol.firstName} ${vol.lastName}`,
      role: 'Volunteer',
      avatar: vol.profileImage ? vol.profileImage : '👨‍💼', // Use profile image or default emoji
      lat: 28.5 + (idx % 15) * 0.12, // Generated coordinates for visualization
      lng: 77.0 + (idx % 15) * 0.12,
      online: Math.random() > 0.5, // Random online status
      activity: vol.focusAreas?.[0] || 'Volunteering',
      city: vol.city || 'India',
      email: vol.email,
      skills: vol.bio || 'Dedicated volunteer',
      hours: vol.volunteerHours || 0,
      verified: vol.isVerified,
    }));

    res.json({
      success: true,
      count: volunteersWithCoords.length,
      volunteers: volunteersWithCoords,
    });
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching volunteers',
      error: error.message,
    });
  }
};

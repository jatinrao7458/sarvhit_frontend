const User = require('../models/User');
const Event = require('../models/Event');
const Post = require('../models/Post');
const VolunteerLog = require('../models/VolunteerLog');
const Badge = require('../models/Badge');

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    let stats = {};
    let activities = [];

    if (user.userType === 'ngo') {
      // NGO Dashboard
      const activeEvents = await Event.countDocuments({
        organizerId: userId,
        status: { $in: ['upcoming', 'ongoing'] },
      });

      const totalVolunteers = await Event.aggregate([
        { $match: { organizerId: userId } },
        { $group: { _id: null, total: { $sum: '$filled' } } },
      ]);

      const fundRaised = await Event.aggregate([
        { $match: { organizerId: userId } },
        { $group: { _id: null, total: { $sum: '$fundRaised' } } },
      ]);

      const pendingVolunteerHours = await VolunteerLog.countDocuments({
        status: 'pending',
      });

      stats = {
        activeEvents,
        volunteersEnrolled: totalVolunteers[0]?.total || 0,
        fundsReceived: fundRaised[0]?.total || 0,
        impactScore: 87, // Mock value
      };

      // Get recent activities
      const recentEvents = await Event.find({ organizerId: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title createdAt filled volunteers')
        .populate('volunteers.volunteerId', 'firstName lastName');

      activities = recentEvents.map((event) => ({
        id: event._id,
        text: `"${event.title}" got ${event.filled} volunteer sign-ups`,
        time: '2h ago',
        type: 'event',
      }));
    } else if (user.userType === 'volunteer') {
      // Volunteer Dashboard
      const eventsJoined = await Event.countDocuments({
        'volunteers.volunteerId': userId,
      });

      const volunteerLogs = await VolunteerLog.find({
        volunteerId: userId,
        status: 'approved',
      });

      const hoursLogged = volunteerLogs.reduce(
        (sum, log) => sum + log.hoursLogged,
        0
      );

      const badgesEarned = await Badge.countDocuments({ userId });

      stats = {
        eventsJoined,
        hoursLogged,
        badgesEarned,
        impactScore: 42, // Mock value
      };

      // Get recent activities
      const recentEvents = await Event.find({
        'volunteers.volunteerId': userId,
      })
        .sort({ 'volunteers.joinedAt': -1 })
        .limit(5)
        .select('title');

      activities = recentEvents.map((event) => ({
        id: event._id,
        text: `Joined "${event.title}"`,
        time: '3h ago',
        type: 'event',
      }));
    } else if (user.userType === 'sponsor') {
      // Sponsor Dashboard
      const projectsFunded = await Event.countDocuments({
        'sponsors.sponsorId': userId,
      });

      const totalDonated = await Event.aggregate([
        { $match: { 'sponsors.sponsorId': userId } },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $sum: '$sponsors.amount',
              },
            },
          },
        },
      ]);

      const ngosSupported = await Event.distinct('organizerId', {
        'sponsors.sponsorId': userId,
      });

      stats = {
        projectsFunded,
        totalDonated: totalDonated[0]?.total || 0,
        ngosSupported: ngosSupported.length,
        impactScore: 65, // Mock value
      };

      // Get recent activities
      const recentEvents = await Event.find({
        'sponsors.sponsorId': userId,
      })
        .sort({ 'sponsors.fundedAt': -1 })
        .limit(5)
        .select('title')
        .populate('sponsors')
        .select('title');

      activities = recentEvents.map((event) => ({
        id: event._id,
        text: `Funded "${event.title}"`,
        time: '5h ago',
        type: 'funding',
      }));
    }

    res.json({
      success: true,
      stats,
      activities,
      userType: user.userType,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message,
    });
  }
};

exports.getSocialFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('authorId', 'firstName lastName email userType')
      .populate('likedBy', 'firstName lastName')
      .populate('comments.userId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments();

    res.json({
      success: true,
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
      },
    });
  } catch (error) {
    console.error('Error fetching social feed:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching social feed',
      error: error.message,
    });
  }
};

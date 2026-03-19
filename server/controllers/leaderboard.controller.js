const User = require('../models/User');
const Event = require('../models/Event');
const VolunteerLog = require('../models/VolunteerLog');

exports.getLeaderboard = async (req, res) => {
  try {
    const { type = 'volunteer', page = 1, limit = 20 } = req.query;

    let users = await User.find({ userType: type })
      .select('firstName lastName email userType city');

    // Calculate points for each user
    const usersWithPoints = await Promise.all(
      users.map(async (user) => {
        // Count events
        let eventCount = 0;
        if (type === 'ngo') {
          eventCount = await Event.countDocuments({ organizerId: user._id });
        } else if (type === 'volunteer') {
          eventCount = await Event.countDocuments({
            'volunteers.volunteerId': user._id,
          });
        } else if (type === 'sponsor') {
          eventCount = await Event.countDocuments({
            'sponsors.sponsorId': user._id,
          });
        }

        // Count volunteer hours (only for volunteers)
        let hoursLogged = 0;
        if (type === 'volunteer') {
          const logs = await VolunteerLog.find({
            volunteerId: user._id,
            status: 'approved',
          });
          hoursLogged = logs.reduce((sum, log) => sum + log.hoursLogged, 0);
        }

        // Get funds (for NGOs and sponsors)
        let funds = 0;
        if (type === 'ngo') {
          const events = await Event.find({ organizerId: user._id });
          funds = events.reduce((sum, event) => sum + (event.fundRaised || 0), 0);
        } else if (type === 'sponsor') {
          const events = await Event.find({
            'sponsors.sponsorId': user._id,
          });
          funds = events.reduce(
            (sum, event) =>
              sum +
              (event.sponsors?.find((s) => s.sponsorId.toString() === user._id.toString())?.amount || 0),
            0
          );
        }

        // Calculate points: events * 10 + hours * 2 + funds / 1000
        const points = Math.round(eventCount * 10 + hoursLogged * 2 + funds / 1000);

        return {
          ...user.toObject(),
          events: eventCount,
          hours: hoursLogged,
          funds,
          points,
        };
      })
    );

    // Sort by points (descending), then events, then hours
    usersWithPoints.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.events !== a.events) return b.events - a.events;
      if (b.hours !== a.hours) return b.hours - a.hours;
      return a.firstName.localeCompare(b.firstName);
    });

    // Add rank
    const rankedUsers = usersWithPoints.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

    // Paginate
    const skip = (page - 1) * limit;
    const paginatedUsers = rankedUsers.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      leaderboard: paginatedUsers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(rankedUsers.length / limit),
        totalUsers: rankedUsers.length,
      },
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
      error: error.message,
    });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Count events
    let eventCount = 0;
    if (user.userType === 'ngo') {
      eventCount = await Event.countDocuments({ organizerId: userId });
    } else if (user.userType === 'volunteer') {
      eventCount = await Event.countDocuments({
        'volunteers.volunteerId': userId,
      });
    } else if (user.userType === 'sponsor') {
      eventCount = await Event.countDocuments({
        'sponsors.sponsorId': userId,
      });
    }

    // Count volunteer hours
    let hoursLogged = 0;
    if (user.userType === 'volunteer') {
      const logs = await VolunteerLog.find({
        volunteerId: userId,
        status: 'approved',
      });
      hoursLogged = logs.reduce((sum, log) => sum + log.hoursLogged, 0);
    }

    // Get funds
    let funds = 0;
    if (user.userType === 'ngo') {
      const events = await Event.find({ organizerId: userId });
      funds = events.reduce((sum, event) => sum + (event.fundRaised || 0), 0);
    } else if (user.userType === 'sponsor') {
      const events = await Event.find({
        'sponsors.sponsorId': userId,
      });
      funds = events.reduce(
        (sum, event) =>
          sum +
          (event.sponsors?.find((s) => s.sponsorId.toString() === userId.toString())?.amount || 0),
        0
      );
    }

    const points = Math.round(eventCount * 10 + hoursLogged * 2 + funds / 1000);

    res.json({
      success: true,
      stats: {
        events: eventCount,
        hours: hoursLogged,
        funds,
        points,
        userType: user.userType,
      },
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user stats',
      error: error.message,
    });
  }
};

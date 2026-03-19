const User = require('../models/User');
const Event = require('../models/Event');
const Badge = require('../models/Badge');

exports.discoverUsers = async (req, res) => {
  try {
    const { type = 'ngo', search = '', location = '', cause = '', page = 1, limit = 10 } = req.query;

    let query = { userType: type };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (location) {
      query.$or = [
        ...(query.$or || []),
        { city: { $regex: location, $options: 'i' } },
      ];
    }

    if (cause) {
      query.focusAreas = { $in: [cause] };
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('firstName lastName email userType city phone bio skills focusAreas')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
      },
    });
  } catch (error) {
    console.error('Error discovering users:', error);
    res.status(500).json({
      success: false,
      message: 'Error discovering users',
      error: error.message,
    });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get user's badges
    const badges = await Badge.find({ userId });

    // Get user's event count
    const eventCount = await Event.countDocuments({
      $or: [
        { organizerId: userId },
        { 'volunteers.volunteerId': userId },
        { 'sponsors.sponsorId': userId },
      ],
    });

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        badges,
        eventCount,
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message,
    });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { skills, focusAreas, bio, phone, city, state, zipCode } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        ...(skills && { skills }),
        ...(focusAreas && { focusAreas }),
        ...(bio && { bio }),
        ...(phone && { phone }),
        ...(city && { city }),
        ...(state && { state }),
        ...(zipCode && { zipCode }),
      },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message,
    });
  }
};

const User = require('../models/User');
const Event = require('../models/Event');
const Badge = require('../models/Badge');
const NGO = require('../models/NGO');
const Volunteer = require('../models/Volunteer');
const Sponsor = require('../models/Sponsor');

// Helper function to get role model
const getRoleModel = (userType) => {
  switch (userType) {
    case 'ngo':
      return NGO;
    case 'volunteer':
      return Volunteer;
    case 'sponsor':
      return Sponsor;
    default:
      return User; // Fallback to User model
  }
};

// Helper function to get visible roles based on user type
const getVisibleRoles = (userType) => {
  // NGO can see: NGOs, Sponsors, Volunteers
  // Volunteer can see: NGOs, Sponsors, Volunteers
  // Sponsor can see: NGOs, Sponsors, Volunteers
  return ['ngo', 'volunteer', 'sponsor'];
};

// Discover users accessible to authenticated user
exports.discoverAccessibleUsers = async (req, res) => {
  try {
    const { search = '', location = '', cause = '', page = 1, limit = 10 } = req.query;
    const userType = req.user.userType; // Get from authenticated user
    const currentUserId = req.user.userId; // Get current user's ID to exclude

    // Get visible roles for this user
    const visibleRoles = getVisibleRoles(userType);

    // Build queries for each visible role
    const queriesPromises = visibleRoles.map(async (role) => {
      const roleModel = getRoleModel(role);
      let query = { isActive: true, userId: { $ne: currentUserId } }; // Exclude current user

      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      if (location) {
        if (query.$or) {
          query.$or.push({ city: { $regex: location, $options: 'i' } });
        } else {
          query.city = { $regex: location, $options: 'i' };
        }
      }

      if (cause) {
        query.focusAreas = { $in: [cause] };
      }

      // Count total for this role
      const count = await roleModel.countDocuments(query);

      // Fetch users for this role
      const users = await roleModel.find(query)
        .select('firstName lastName email city phone bio skills focusAreas profileImage userId')
        .lean();

      return { users, role, count };
    });

    const results = await Promise.all(queriesPromises);

    // Combine results from all roles
    let allUsers = [];
    let totalCount = 0;

    results.forEach((result) => {
      // Add role type to each user for frontend display
      const usersWithRole = result.users.map(user => ({
        ...user,
        userType: result.role,
      }));
      allUsers = allUsers.concat(usersWithRole);
      totalCount += result.count;
    });

    // Sort by creation date (newest first) and apply pagination
    const skip = (page - 1) * limit;
    const paginatedUsers = allUsers.sort((a, b) => {
      // Assuming newer users have higher IDs - adjust if needed
      return b._id - a._id;
    }).slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      users: paginatedUsers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalUsers: totalCount,
      },
    });
  } catch (error) {
    console.error('Error discovering accessible users:', error);
    res.status(500).json({
      success: false,
      message: 'Error discovering users',
      error: error.message,
    });
  }
};

exports.discoverUsers = async (req, res) => {
  try {
    const { type = 'ngo', search = '', location = '', cause = '', page = 1, limit = 10 } = req.query;

    const roleModel = getRoleModel(type);
    let query = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (location) {
      if (query.$or) {
        query.$or.push({ city: { $regex: location, $options: 'i' } });
      } else {
        query.city = { $regex: location, $options: 'i' };
      }
    }

    if (cause) {
      query.focusAreas = { $in: [cause] };
    }

    // Add isActive filter
    query.isActive = true;

    const skip = (page - 1) * limit;

    const users = await roleModel.find(query)
      .select('firstName lastName email city phone bio skills focusAreas profileImage')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await roleModel.countDocuments(query);

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

    // Get user profile from role-based collection
    const roleModel = getRoleModel(user.userType);
    const roleProfile = await roleModel.findOne({ userId });

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
        ...roleProfile?.toObject(),
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

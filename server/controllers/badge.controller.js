const Badge = require('../models/Badge');
const User = require('../models/User');

exports.getBadges = async (req, res) => {
  try {
    const { userId } = req.query;

    const badges = await Badge.find({
      userId: userId || req.user.userId,
    }).sort({ earnedAt: -1 });

    res.json({
      success: true,
      badges,
      count: badges.length,
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching badges',
      error: error.message,
    });
  }
};

exports.awardBadge = async (req, res) => {
  try {
    const { userId, badgeName, description, criteria } = req.body;

    if (!userId || !badgeName) {
      return res.status(400).json({
        success: false,
        message: 'User ID and badge name are required',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if badge already exists
    const existingBadge = await Badge.findOne({
      userId,
      badgeName,
    });

    if (existingBadge) {
      return res.status(400).json({
        success: false,
        message: 'User already has this badge',
      });
    }

    const badge = new Badge({
      userId,
      badgeName,
      description: description || '',
      criteria: criteria || '',
      earnedAt: new Date(),
    });

    await badge.save();

    // Add badge to user's badges array
    user.badges.push(badge._id);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Badge awarded successfully',
      badge,
    });
  } catch (error) {
    console.error('Error awarding badge:', error);
    res.status(500).json({
      success: false,
      message: 'Error awarding badge',
      error: error.message,
    });
  }
};

exports.getAllBadges = async (req, res) => {
  try {
    const badges = [
      {
        name: 'First Responder',
        description: 'Completed 50 volunteer hours',
        icon: '🏆',
      },
      {
        name: 'Volunteer Master',
        description: 'Completed 100 volunteer hours',
        icon: '👑',
      },
      {
        name: 'Environmental Champion',
        description: 'Participated in 5 environment events',
        icon: '🌿',
      },
      {
        name: 'Education Hero',
        description: 'Participated in 5 education events',
        icon: '📚',
      },
      {
        name: 'Healthcare Advocate',
        description: 'Participated in 5 healthcare events',
        icon: '💊',
      },
      {
        name: 'Community Builder',
        description: 'Participated in 5 community events',
        icon: '🤝',
      },
      {
        name: 'Fundraising Star',
        description: 'Helped raise ₹100,000 for events',
        icon: '💰',
      },
    ];

    res.json({
      success: true,
      badges,
    });
  } catch (error) {
    console.error('Error fetching all badges:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching all badges',
      error: error.message,
    });
  }
};

const User = require('../models/User');

class UserService {
  // Create a new user
  static async createUser(userData) {
    try {
      const { firstName, lastName, email, password, userType, bio, phone, address, city, state, zipCode } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Auto-generate lastName if not provided
      const finalLastName = lastName && lastName.trim() ? lastName : 'User';

      const user = new User({
        firstName,
        lastName: finalLastName,
        email,
        password,
        userType,
        bio,
        phone,
        address,
        city,
        state,
        zipCode
      });

      await user.save();
      return user.toJSON();
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const user = await User.findOne({ email });
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(userId) {
    try {
      const user = await User.findById(userId);
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Update user profile
  static async updateUser(userId, updateData) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { ...updateData, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      return user.toJSON();
    } catch (error) {
      throw error;
    }
  }

  // Get user by ID with sensitive data removed
  static async getUserProfile(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return user.toJSON();
    } catch (error) {
      throw error;
    }
  }

  // Delete user
  static async deleteUser(userId) {
    try {
      const user = await User.findByIdAndDelete(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Get all users (with pagination)
  static async getAllUsers(page = 1, limit = 10, userType = null) {
    try {
      const skip = (page - 1) * limit;
      let query = {};

      if (userType) {
        query.userType = userType;
      }

      const users = await User.find(query)
        .skip(skip)
        .limit(limit)
        .select('-password -verificationToken');

      const total = await User.countDocuments(query);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Verify email
  static async verifyEmail(userId) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { isVerified: true, verificationToken: null, updatedAt: Date.now() },
        { new: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      return user.toJSON();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserService;

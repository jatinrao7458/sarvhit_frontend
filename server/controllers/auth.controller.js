const UserService = require('../services/user.service');
const TokenBlacklistService = require('../services/tokenBlacklist.service');
const { generateToken } = require('../utils/jwt');
const { validateLoginInput, validateSignupInput } = require('../utils/validators');
const NGO = require('../models/NGO');
const Volunteer = require('../models/Volunteer');
const Sponsor = require('../models/Sponsor');

class AuthController {
  // Helper method to sync user to role-based collection
  static async syncUserToRoleCollection(user) {
    try {
      const userData = {
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        zipCode: user.zipCode,
        bio: user.bio,
        profileImage: user.profileImage,
        skills: user.skills,
        focusAreas: user.focusAreas,
        badges: user.badges,
        connections: user.connections,
        isActive: user.isActive,
        isVerified: user.isVerified,
      };

      let roleModel;
      switch (user.userType) {
        case 'ngo':
          roleModel = NGO;
          break;
        case 'volunteer':
          roleModel = Volunteer;
          break;
        case 'sponsor':
          roleModel = Sponsor;
          break;
        default:
          return null;
      }

      // Upsert: create if doesn't exist, update if exists
      const syncedUser = await roleModel.findOneAndUpdate(
        { userId: user._id },
        userData,
        { upsert: true, new: true }
      );

      return syncedUser;
    } catch (error) {
      console.error('Error syncing user to role collection:', error);
      throw error;
    }
  }
  // Login
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      const validation = validateLoginInput(email, password);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          errors: validation.errors
        });
      }

      // Find user by email
      const user = await UserService.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'User account is deactivated'
        });
      }

      // Compare password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      // Sync user to role-based collection
      await AuthController.syncUserToRoleCollection(user);

      // Generate token
      const token = generateToken({
        userId: user._id,
        email: user.email,
        userType: user.userType
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: user.toJSON()
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Login failed'
      });
    }
  }

  // Signup
  static async signup(req, res) {
    try {
      const { firstName, lastName, email, password, userType, bio, phone, address, city, state, zipCode } = req.body;

      // Validate input
      const validation = validateSignupInput(firstName, lastName, email, password, userType);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          errors: validation.errors
        });
      }

      // Create user
      const user = await UserService.createUser({
        firstName,
        lastName,
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

      // Sync user to role-based collection
      await AuthController.syncUserToRoleCollection(user);

      // Generate token
      const token = generateToken({
        userId: user._id,
        email: user.email,
        userType: user.userType
      });

      res.status(201).json({
        success: true,
        message: 'Signup successful',
        token,
        user
      });
    } catch (error) {
      console.error('Signup error:', error);

      // Handle duplicate email error
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Signup failed'
      });
    }
  }

  // Get user profile
  static async getProfile(req, res) {
    try {
      const userId = req.user.userId;

      const user = await UserService.getUserProfile(userId);
      res.status(200).json({
        success: true,
        user
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get profile'
      });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const userId = req.user.userId;
      const updateData = req.body;

      // Don't allow updating email or userType directly
      delete updateData.email;
      delete updateData.userType;
      delete updateData.password;

      const user = await UserService.updateUser(userId, updateData);

      // Sync updated user to role-based collection
      await AuthController.syncUserToRoleCollection(user);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update profile'
      });
    }
  }

  // Logout (client-side deletion of token)
  static async logout(req, res) {
    try {
      // Extract token from Authorization header
      const token = req.headers.authorization?.split(' ')[1];

      if (token) {
        // Add token to blacklist
        await TokenBlacklistService.blacklistToken(token, req.user.userId);
      }

      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Logout failed'
      });
    }
  }
}

module.exports = AuthController;

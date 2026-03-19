const TokenBlacklist = require('../models/TokenBlacklist');

class TokenBlacklistService {
  // Add token to blacklist
  static async blacklistToken(token, userId) {
    try {
      const blacklistedToken = new TokenBlacklist({
        token,
        userId
      });

      await blacklistedToken.save();
      return { success: true, message: 'Token blacklisted successfully' };
    } catch (error) {
      // If token already exists, it's already blacklisted
      if (error.code === 11000) {
        return { success: true, message: 'Token already blacklisted' };
      }
      throw error;
    }
  }

  // Check if token is blacklisted
  static async isTokenBlacklisted(token) {
    try {
      const blacklistedToken = await TokenBlacklist.findOne({ token });
      return !!blacklistedToken;
    } catch (error) {
      console.error('Error checking token blacklist:', error);
      return false; // If there's an error, allow the token (fail-safe)
    }
  }

  // Remove expired tokens (cleanup method)
  static async cleanupExpiredTokens() {
    try {
      const result = await TokenBlacklist.deleteMany({
        createdAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Older than 7 days
      });
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
      return 0;
    }
  }

  // Get all blacklisted tokens for a user (for logout all devices)
  static async blacklistAllUserTokens(userId) {
    try {
      // This would require storing all active tokens per user
      // For now, we'll implement single token logout
      return { success: true, message: 'User tokens management not implemented yet' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TokenBlacklistService;

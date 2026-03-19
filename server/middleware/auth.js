const jwt = require('jsonwebtoken');
const TokenBlacklistService = require('../services/tokenBlacklist.service');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Check if token is blacklisted
    const isBlacklisted = await TokenBlacklistService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Token has been invalidated. Please login again.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;

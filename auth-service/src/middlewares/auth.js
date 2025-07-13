const jwt = require('jsonwebtoken');
const redisService = require('../services/redisService');
require('dotenv').config();

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Validate token in Redis
    const isTokenValid = await redisService.validateToken(decoded.id, token);
    if (!isTokenValid) {
      return res.status(401).json({ message: 'Token is invalid or expired' });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    console.error('Auth middleware error:', err);
    return res.status(500).json({ message: 'Authentication error' });
  }
}; 
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user details from auth service
    try {
      const authResponse = await axios.get(`${process.env.AUTH_SERVICE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      req.user = { ...decoded, ...authResponse.data };
    } catch (authError) {
      console.log('Failed to fetch user details from auth service, using token data only');
      req.user = decoded;
    }
    
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}; 
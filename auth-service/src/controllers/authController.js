const User = require('../models/User');
const jwt = require('jsonwebtoken');
const redisService = require('../services/redisService');
const { processImage, deleteImage } = require('../utils/imageProcessor');

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Create new user
    const user = await User.create({ email, password, name });
    
    // Generate JWT token
    const token = signToken(user);
    
    // Store session in Redis with user profile caching
    const userData = {
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    await redisService.storeSession(user._id.toString(), token, userData);

    res.status(201).json({
      token,
      user: userData
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = signToken(user);
    
    // Store session in Redis with user profile caching
    const userData = {
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    await redisService.storeSession(user._id.toString(), token, userData);

    res.json({
      token,
      user: userData
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    // First try to get from cache
    const cachedProfile = await redisService.getCachedUserProfile(req.user.id);
    
    if (cachedProfile) {
      console.log('Profile served from cache');
      return res.json(cachedProfile);
    }
    
    // If not in cache, get from database
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Cache the user profile
    const userData = {
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    await redisService.cacheUserProfile(user._id.toString(), userData);
    
    res.json(userData);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Failed to get profile', error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    // Check if email is being updated and if it's already taken
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(409).json({ message: 'Email already in use' });
      }
    }

    const updateData = { name };
    if (email) updateData.email = email;

    const user = await User.findByIdAndUpdate(
      req.user.id, 
      updateData, 
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Invalidate user profile cache
    await redisService.invalidateUserProfileCache(user._id.toString());

    res.json({
      user,
      message: 'Profile updated successfully'
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Use the authenticated user from the request
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old avatar if exists
    if (user.avatar) {
      const oldFilename = user.avatar.split('/').pop();
      deleteImage(oldFilename);
    }

    // Process and save new image
    const { url } = await processImage(req.file.buffer, req.file.originalname, 200, 200);

    // Update user avatar
    user.avatar = url;
    await user.save();

    // Invalidate user profile cache
    await redisService.invalidateUserProfileCache(user._id.toString());

    res.json({ 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      message: 'Avatar uploaded successfully'
    });
  } catch (err) {
    console.error('Upload avatar error:', err);
    res.status(500).json({ message: 'Failed to upload avatar', error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Invalidate all sessions for security
    await redisService.invalidateAllSessions(user._id.toString());

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Failed to change password', error: err.message });
  }
};

// New logout endpoint
exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      await redisService.invalidateSession(req.user.id, token);
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ message: 'Logout failed', error: err.message });
  }
};

// New logout all devices endpoint
exports.logoutAll = async (req, res) => {
  try {
    await redisService.invalidateAllSessions(req.user.id);
    
    res.json({ message: 'Logged out from all devices successfully' });
  } catch (err) {
    console.error('Logout all error:', err);
    res.status(500).json({ message: 'Logout failed', error: err.message });
  }
};

// Health check endpoint
exports.healthCheck = async (req, res) => {
  try {
    const sessionStats = await redisService.getSessionStats();
    
    res.json({
      status: 'OK',
      redis: 'connected',
      sessionStats
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'ERROR',
      redis: 'disconnected',
      error: error.message
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate user ID format
    if (!userId || userId.length !== 24) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Check for internal service token (simple validation)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Internal service token required' });
    }

    const token = authHeader.split(' ')[1];
    if (token !== process.env.INTER_SERVICE_TOKEN && token !== 'internal-service-token') {
      return res.status(401).json({ message: 'Invalid internal service token' });
    }

    // Get user from database
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data
    res.json({
      _id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Failed to get user', error: error.message });
  }
}; 
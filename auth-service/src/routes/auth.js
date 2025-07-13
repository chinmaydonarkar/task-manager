const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');
const { uploadAvatar, handleUploadError } = require('../middlewares/upload');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', auth, authController.getProfile);
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);
router.post('/profile/avatar', auth, uploadAvatar, handleUploadError, authController.uploadAvatar);
router.put('/profile/password', auth, authController.changePassword);

// Session management routes
router.post('/logout', auth, authController.logout);
router.post('/logout-all', auth, authController.logoutAll);

// Internal service routes (for inter-service communication)
router.get('/users/:userId', authController.getUserById);

// Health check route
router.get('/health', authController.healthCheck);

module.exports = router; 
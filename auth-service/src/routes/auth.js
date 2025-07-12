const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');
const { uploadAvatar, handleUploadError } = require('../middlewares/upload');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);
router.post('/profile/avatar',auth, uploadAvatar, handleUploadError, authController.uploadAvatar);
router.put('/profile/password', auth, authController.changePassword);

module.exports = router; 
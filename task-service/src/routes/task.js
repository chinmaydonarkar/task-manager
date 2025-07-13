const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middlewares/auth');
const multer = require('multer');
const cronService = require('../services/cronService');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF, DOCX, JPG allowed'));
  }
});

router.post('/', auth, upload.array('files'), taskController.createTask);
router.get('/', auth, taskController.getTasks);
router.get('/export/csv', auth, taskController.exportTasksCSV);
router.get('/:id', auth, taskController.getTask);
router.put('/:id', auth, upload.array('files'), taskController.updateTask);
router.delete('/:id', auth, taskController.deleteTask);

// Cron job management endpoints
router.get('/cron/stats', async (req, res) => {
  try {
    const stats = cronService.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get cron statistics',
      error: error.message
    });
  }
});

router.post('/cron/trigger', async (req, res) => {
  try {
    await cronService.triggerManually();
    res.json({
      success: true,
      message: 'Cron job triggered successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to trigger cron job',
      error: error.message
    });
  }
});

router.get('/cron/reminders/today', async (req, res) => {
  try {
    const tasksByUser = await cronService.getAllTasksDueToday();
    const totalTasks = Object.values(tasksByUser).reduce((sum, tasks) => sum + tasks.length, 0);
    
    res.json({
      success: true,
      data: {
        usersWithTasks: Object.keys(tasksByUser).length,
        totalTasks,
        tasksByUser
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get today\'s reminders',
      error: error.message
    });
  }
});

// Enhanced cron job management endpoints
router.get('/cron/health', async (req, res) => {
  try {
    const health = cronService.getHealthStatus();
    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get cron health status',
      error: error.message
    });
  }
});

router.post('/cron/start', async (req, res) => {
  try {
    cronService.startScheduler();
    res.json({
      success: true,
      message: 'Cron job scheduler started successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to start cron job scheduler',
      error: error.message
    });
  }
});

router.post('/cron/stop', async (req, res) => {
  try {
    cronService.stopScheduler();
    res.json({
      success: true,
      message: 'Cron job scheduler stopped successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to stop cron job scheduler',
      error: error.message
    });
  }
});

// WebSocket management endpoints
router.get('/socket/stats', async (req, res) => {
  try {
    const taskController = require('../controllers/taskController');
    const taskUpdateService = taskController.getTaskUpdateService();
    
    if (taskUpdateService) {
      const stats = taskUpdateService.getSocketStats();
      res.json({
        success: true,
        data: stats
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'WebSocket service not available'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get WebSocket statistics',
      error: error.message
    });
  }
});

router.get('/socket/users/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const taskController = require('../controllers/taskController');
    const taskUpdateService = taskController.getTaskUpdateService();
    
    if (taskUpdateService) {
      const users = taskUpdateService.getUsersInTask(taskId);
      res.json({
        success: true,
        data: {
          taskId,
          connectedUsers: users.length,
          users
        }
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'WebSocket service not available'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get users in task',
      error: error.message
    });
  }
});

module.exports = router; 
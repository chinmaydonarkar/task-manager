const cron = require('node-cron');
const Task = require('../models/Task');
const emailService = require('./emailService');
const userService = require('./userService');
const logger = require('../utils/logger');
const emailRetryUtil = require('../utils/emailRetry');
const cronConfig = require('../config/cron');

/**
 * Enhanced Cron Service for Daily Task Reminders
 * Follows DRY principles and best practices
 */
class CronService {
  constructor() {
    this.isRunning = false;
    this.lastRun = null;
    this.nextRun = null;
    this.stats = {
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      totalEmailsSent: 0,
      totalUsersNotified: 0,
      averageExecutionTime: 0
    };
    
    // Initialize cron schedule
    this.initializeCronSchedule();
  }

  /**
   * Initialize the cron schedule with proper timezone
   */
  initializeCronSchedule() {
    // Schedule daily reminders at 8 AM (Indian timezone)
    this.cronJob = cron.schedule(cronConfig.dailyReminder.schedule, () => {
      this.executeDailyReminders();
    }, {
      scheduled: true,
      timezone: cronConfig.dailyReminder.timezone
    });

    // Calculate next run time
    this.calculateNextRun();
    
    logger.info(`Daily reminder cron job scheduled for ${cronConfig.dailyReminder.description}`);
  }

  /**
   * Calculate the next scheduled run time
   */
  calculateNextRun() {
    const now = new Date();
    const nextRun = new Date();
    nextRun.setHours(8, 0, 0, 0);
    
    // If it's past 8 AM today, schedule for tomorrow
    if (now.getHours() >= 8) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    
    this.nextRun = nextRun;
  }

  /**
   * Get date range for today (DRY principle)
   * @returns {Object} Object with today and tomorrow dates
   */
  getTodayDateRange() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    return { today, tomorrow };
  }

  /**
   * Get tasks due today for a specific user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of tasks due today
   */
  async getTasksDueToday(userId) {
    try {
      const { today, tomorrow } = this.getTodayDateRange();

      const tasks = await Task.find({
        user: userId,
        dueDate: { $gte: today, $lt: tomorrow },
        status: { $in: ['Pending', 'In Progress'] }
      }).sort({ dueDate: 1 });

      return tasks;
    } catch (error) {
      logger.error(`Failed to fetch tasks for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Get all tasks due today across all users (DRY principle)
   * @returns {Promise<Object>} Object with userId as key and tasks array as value
   */
  async getAllTasksDueToday() {
    try {
      const { today, tomorrow } = this.getTodayDateRange();

      const tasks = await Task.find({
        dueDate: { $gte: today, $lt: tomorrow },
        status: { $in: ['Pending', 'In Progress'] }
      }).populate('user', 'email name').sort({ dueDate: 1 });

      // Group tasks by user using DRY principle
      return this.groupTasksByUser(tasks);
    } catch (error) {
      logger.error('Failed to fetch tasks due today:', error);
      return {};
    }
  }

  /**
   * Group tasks by user (DRY principle - reusable method)
   * @param {Array} tasks - Array of tasks with populated user data
   * @returns {Object} Object with userId as key and tasks array as value
   */
  groupTasksByUser(tasks) {
    const tasksByUser = {};
    tasks.forEach(task => {
      const userId = task.user._id.toString();
      if (!tasksByUser[userId]) {
        tasksByUser[userId] = [];
      }
      tasksByUser[userId].push(task);
    });
    return tasksByUser;
  }

  /**
   * Send reminder email to a single user with retry logic (DRY principle)
   * @param {Object} user - User object with email and name
   * @param {Array} tasks - Array of tasks for the user
   * @returns {Promise<boolean>} Success status
   */
  async sendReminderToUser(user, tasks) {
    try {
      if (!user || !user.email) {
        logger.warn(`User ${user?._id || 'unknown'} not found or has no email`);
        return false;
      }

      if (!tasks || tasks.length === 0) {
        logger.debug(`No tasks found for user ${user.email}`);
        return false;
      }

      // Use retry utility for email sending
      const success = await emailRetryUtil.sendWithRetry(
        emailService.sendTaskReminderNotification,
        [user.email, user.name || 'User', tasks]
      );

      if (success) {
        logger.info(`Reminder sent to ${user.email} for ${tasks.length} tasks`);
      }
      
      return success;
    } catch (error) {
      logger.error(`Failed to send reminder to user ${user.email}:`, error);
      return false;
    }
  }

  /**
   * Send reminder emails to users with tasks due today
   * @returns {Promise<Object>} Statistics about the reminder process
   */
  async sendDailyReminders() {
    const startTime = Date.now();
    const stats = {
      totalUsers: 0,
      usersNotified: 0,
      emailsSent: 0,
      errors: 0,
      startTime,
      endTime: null,
      executionTime: 0
    };

    try {
      logger.info('Starting daily task reminder process...');
      
      // Get all tasks due today grouped by user
      const tasksByUser = await this.getAllTasksDueToday();
      const userIds = Object.keys(tasksByUser);
      
      stats.totalUsers = userIds.length;
      logger.info(`Found ${userIds.length} users with tasks due today`);

      if (userIds.length === 0) {
        logger.info('No tasks due today. Skipping reminder process.');
        return stats;
      }

      // Fetch user details for all users
      const users = await userService.getUsersByIds(userIds);
      const userMap = new Map(users.map(user => [user._id.toString(), user]));

      // Process each user with improved error handling
      const emailPromises = userIds.map(async (userId) => {
        try {
          const user = userMap.get(userId);
          const tasks = tasksByUser[userId];
          
          const success = await this.sendReminderToUser(user, tasks);
          
          if (success) {
            stats.usersNotified++;
            stats.emailsSent++;
          } else {
            stats.errors++;
          }
        } catch (error) {
          logger.error(`Failed to process user ${userId}:`, error);
          stats.errors++;
        }
      });

      // Wait for all emails to be sent
      await Promise.allSettled(emailPromises);

      stats.endTime = Date.now();
      stats.executionTime = stats.endTime - startTime;

      logger.info(`Daily reminder process completed in ${stats.executionTime}ms`, {
        totalUsers: stats.totalUsers,
        usersNotified: stats.usersNotified,
        emailsSent: stats.emailsSent,
        errors: stats.errors,
        executionTime: stats.executionTime
      });

      return stats;
    } catch (error) {
      logger.error('Daily reminder process failed:', error);
      stats.errors++;
      stats.endTime = Date.now();
      stats.executionTime = stats.endTime - startTime;
      return stats;
    }
  }

  /**
   * Execute the daily reminder cron job with enhanced monitoring
   */
  async executeDailyReminders() {
    if (this.isRunning) {
      logger.warn('Daily reminder job is already running. Skipping...');
      return;
    }

    this.isRunning = true;
    this.lastRun = new Date();
    this.stats.totalRuns++;

    const jobStartTime = Date.now();

    try {
      logger.info('Executing daily task reminder job...');
      const result = await this.sendDailyReminders();
      
      // Update statistics
      if (result.errors === 0) {
        this.stats.successfulRuns++;
        logger.info('Daily reminder job completed successfully');
      } else {
        this.stats.failedRuns++;
        logger.warn(`Daily reminder job completed with ${result.errors} errors`);
      }

      this.stats.totalEmailsSent += result.emailsSent;
      this.stats.totalUsersNotified += result.usersNotified;
      
      // Calculate average execution time
      const jobExecutionTime = Date.now() - jobStartTime;
      this.stats.averageExecutionTime = 
        (this.stats.averageExecutionTime * (this.stats.totalRuns - 1) + jobExecutionTime) / this.stats.totalRuns;

      // Recalculate next run time
      this.calculateNextRun();
      
    } catch (error) {
      this.stats.failedRuns++;
      logger.error('Daily reminder job failed:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Get comprehensive statistics about the cron job
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      ...this.stats,
      lastRun: this.lastRun,
      nextRun: this.nextRun,
      isRunning: this.isRunning,
      isScheduled: this.cronJob ? this.cronJob.running : false
    };
  }

  /**
   * Start the cron job scheduler
   */
  startScheduler() {
    if (this.cronJob && !this.cronJob.running) {
      this.cronJob.start();
      logger.info('Daily reminder cron job started');
    }
  }

  /**
   * Stop the cron job scheduler
   */
  stopScheduler() {
    if (this.cronJob && this.cronJob.running) {
      this.cronJob.stop();
      logger.info('Daily reminder cron job stopped');
    }
  }

  /**
   * Manually trigger the reminder job (for testing)
   */
  async triggerManually() {
    logger.info('Manually triggering daily reminder job...');
    await this.executeDailyReminders();
  }

  /**
   * Get health status of the cron service
   * @returns {Object} Health status object
   */
  getHealthStatus() {
    return {
      isRunning: this.isRunning,
      isScheduled: this.cronJob ? this.cronJob.running : false,
      lastRun: this.lastRun,
      nextRun: this.nextRun,
      totalRuns: this.stats.totalRuns,
      successRate: this.stats.totalRuns > 0 ? 
        (this.stats.successfulRuns / this.stats.totalRuns * 100).toFixed(2) : 0
    };
  }
}

// Export singleton instance
module.exports = new CronService(); 
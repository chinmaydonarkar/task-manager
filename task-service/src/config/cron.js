/**
 * Cron Job Configuration
 * Centralized configuration for all cron job settings
 */

module.exports = {
  // Daily reminder schedule (8 AM IST)
  dailyReminder: {
    schedule: '0 8 * * *',
    timezone: 'Asia/Kolkata',
    description: 'Daily task reminder at 8:00 AM IST'
  },

  // Health check schedule (every 5 minutes)
  healthCheck: {
    schedule: '*/5 * * * *',
    timezone: 'Asia/Kolkata',
    description: 'Health check every 5 minutes'
  },

  // Session cleanup schedule (every hour)
  sessionCleanup: {
    schedule: '0 * * * *',
    timezone: 'Asia/Kolkata',
    description: 'Session cleanup every hour'
  },

  // Email settings
  email: {
    maxRetries: 3,
    retryDelay: 5000, // 5 seconds
    batchSize: 50, // Process 50 emails at a time
    timeout: 30000 // 30 seconds timeout
  },

  // Database query settings
  database: {
    timeout: 10000, // 10 seconds
    maxRetries: 3,
    batchSize: 100 // Process 100 users at a time
  },

  // Logging settings
  logging: {
    level: process.env.CRON_LOG_LEVEL || 'info',
    includeStats: true,
    includePerformance: true
  },

  // Monitoring settings
  monitoring: {
    trackExecutionTime: true,
    trackSuccessRate: true,
    trackEmailDelivery: true,
    alertOnFailure: true
  },

  // Timezone settings
  timezone: {
    default: 'Asia/Kolkata',
    fallback: 'UTC'
  },

  // Job execution settings
  execution: {
    maxConcurrentJobs: 1,
    jobTimeout: 300000, // 5 minutes
    preventOverlap: true
  }
}; 
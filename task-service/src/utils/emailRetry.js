const logger = require('./logger');
const cronConfig = require('../config/cron');

/**
 * Email Retry Utility
 * Handles retry logic for email sending with exponential backoff
 */
class EmailRetryUtil {
  constructor() {
    this.config = cronConfig.email;
  }

  /**
   * Send email with retry logic
   * @param {Function} emailFunction - The email sending function
   * @param {Array} params - Parameters to pass to the email function
   * @returns {Promise<boolean>} Success status
   */
  async sendWithRetry(emailFunction, params) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        await emailFunction(...params);
        if (attempt > 1) {
          logger.info(`Email sent successfully on attempt ${attempt}`);
        }
        return true;
      } catch (error) {
        lastError = error;
        logger.warn(`Email attempt ${attempt} failed:`, error.message);
        
        if (attempt < this.config.maxRetries) {
          const delay = this.calculateDelay(attempt);
          logger.info(`Retrying email in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }
    
    logger.error(`Email failed after ${this.config.maxRetries} attempts:`, lastError);
    return false;
  }

  /**
   * Calculate delay for exponential backoff
   * @param {number} attempt - Current attempt number
   * @returns {number} Delay in milliseconds
   */
  calculateDelay(attempt) {
    return this.config.retryDelay * Math.pow(2, attempt - 1);
  }

  /**
   * Sleep utility for delays
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} Promise that resolves after delay
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Process emails in batches
   * @param {Array} emailJobs - Array of email job objects
   * @returns {Promise<Object>} Batch processing results
   */
  async processBatch(emailJobs) {
    const results = {
      total: emailJobs.length,
      successful: 0,
      failed: 0,
      errors: []
    };

    const batchSize = this.config.batchSize;
    
    for (let i = 0; i < emailJobs.length; i += batchSize) {
      const batch = emailJobs.slice(i, i + batchSize);
      const batchPromises = batch.map(async (job) => {
        try {
          const success = await this.sendWithRetry(job.emailFunction, job.params);
          if (success) {
            results.successful++;
          } else {
            results.failed++;
            results.errors.push({
              user: job.user,
              error: 'Email sending failed after retries'
            });
          }
        } catch (error) {
          results.failed++;
          results.errors.push({
            user: job.user,
            error: error.message
          });
        }
      });

      await Promise.allSettled(batchPromises);
      
      // Small delay between batches to prevent overwhelming the email service
      if (i + batchSize < emailJobs.length) {
        await this.sleep(1000);
      }
    }

    return results;
  }
}

module.exports = new EmailRetryUtil(); 
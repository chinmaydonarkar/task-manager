const axios = require('axios');

class UserService {
  constructor() {
    this.authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:5000';
  }

  /**
   * Fetch user details by user ID
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} User object with email and name
   */
  async getUserById(userId) {
    try {
      const response = await axios.get(`${this.authServiceUrl}/api/auth/users/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.INTER_SERVICE_TOKEN || 'internal-service-token'}`
        },
        timeout: 5000
      });
      
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch user ${userId}:`, error.message);
      return null;
    }
  }

  /**
   * Fetch multiple users by their IDs
   * @param {Array<string>} userIds - Array of user IDs
   * @returns {Promise<Array>} Array of user objects
   */
  async getUsersByIds(userIds) {
    try {
      const uniqueUserIds = [...new Set(userIds)];
      const userPromises = uniqueUserIds.map(userId => this.getUserById(userId));
      const users = await Promise.allSettled(userPromises);
      
      return users
        .filter(result => result.status === 'fulfilled' && result.value)
        .map(result => result.value);
    } catch (error) {
      console.error('Failed to fetch users:', error.message);
      return [];
    }
  }
}

module.exports = new UserService(); 
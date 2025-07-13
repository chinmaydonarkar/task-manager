const redis = require('../config/redis');
const jwt = require('jsonwebtoken');

// Redis key prefixes for better organization
const KEY_PREFIXES = {
  SESSION: 'session:',
  USER_PROFILE: 'user:profile:',
  USER_TOKENS: 'user:tokens:',
  BLACKLIST: 'blacklist:'
};

// TTL constants (in seconds)
const TTL = {
  SESSION: 24 * 60 * 60, // 24 hours
  USER_PROFILE: 30 * 60, // 30 minutes
  TOKEN_BLACKLIST: 24 * 60 * 60 // 24 hours
};

class RedisService {
  /**
   * Session Management Methods
   */
  
  /**
   * Store user session with token
   * @param {string} userId - User ID
   * @param {string} token - JWT token
   * @param {Object} userData - User data to cache
   * @returns {Promise<boolean>}
   */
  async storeSession(userId, token, userData = null) {
    try {
      const sessionKey = `${KEY_PREFIXES.SESSION}${userId}`;
      const tokenKey = `${KEY_PREFIXES.USER_TOKENS}${userId}`;
      
      // Store session data
      const sessionData = {
        token,
        userId,
        createdAt: Date.now(),
        expiresAt: Date.now() + (TTL.SESSION * 1000)
      };
      
      // Use Redis pipeline for atomic operations
      const pipeline = redis.pipeline();
      
      // Store session
      pipeline.setex(sessionKey, TTL.SESSION, JSON.stringify(sessionData));
      
      // Store token for user
      pipeline.sadd(tokenKey, token);
      pipeline.expire(tokenKey, TTL.SESSION);
      
      // Cache user profile if provided
      if (userData) {
        const profileKey = `${KEY_PREFIXES.USER_PROFILE}${userId}`;
        pipeline.setex(profileKey, TTL.USER_PROFILE, JSON.stringify(userData));
      }
      
      await pipeline.exec();
      
      console.log(`Session stored for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error storing session:', error);
      return false;
    }
  }
  
  /**
   * Get session data for user
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>}
   */
  async getSession(userId) {
    try {
      const sessionKey = `${KEY_PREFIXES.SESSION}${userId}`;
      const sessionData = await redis.get(sessionKey);
      
      if (!sessionData) {
        return null;
      }
      
      return JSON.parse(sessionData);
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }
  
  /**
   * Validate if token is valid for user
   * @param {string} userId - User ID
   * @param {string} token - JWT token
   * @returns {Promise<boolean>}
   */
  async validateToken(userId, token) {
    try {
      const tokenKey = `${KEY_PREFIXES.USER_TOKENS}${userId}`;
      const blacklistKey = `${KEY_PREFIXES.BLACKLIST}${token}`;
      
      // Check if token is blacklisted
      const isBlacklisted = await redis.exists(blacklistKey);
      if (isBlacklisted) {
        return false;
      }
      
      // Check if token exists in user's active tokens
      const isValid = await redis.sismember(tokenKey, token);
      return isValid === 1;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }
  
  /**
   * Invalidate user session (logout)
   * @param {string} userId - User ID
   * @param {string} token - JWT token to invalidate
   * @returns {Promise<boolean>}
   */
  async invalidateSession(userId, token) {
    try {
      const sessionKey = `${KEY_PREFIXES.SESSION}${userId}`;
      const tokenKey = `${KEY_PREFIXES.USER_TOKENS}${userId}`;
      const blacklistKey = `${KEY_PREFIXES.BLACKLIST}${token}`;
      
      const pipeline = redis.pipeline();
      
      // Remove session
      pipeline.del(sessionKey);
      
      // Remove token from user's active tokens
      pipeline.srem(tokenKey, token);
      
      // Add token to blacklist
      pipeline.setex(blacklistKey, TTL.TOKEN_BLACKLIST, '1');
      
      // Clear user profile cache
      const profileKey = `${KEY_PREFIXES.USER_PROFILE}${userId}`;
      pipeline.del(profileKey);
      
      await pipeline.exec();
      
      console.log(`Session invalidated for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error invalidating session:', error);
      return false;
    }
  }
  
  /**
   * Invalidate all sessions for user (force logout from all devices)
   * @param {string} userId - User ID
   * @returns {Promise<boolean>}
   */
  async invalidateAllSessions(userId) {
    try {
      const sessionKey = `${KEY_PREFIXES.SESSION}${userId}`;
      const tokenKey = `${KEY_PREFIXES.USER_TOKENS}${userId}`;
      const profileKey = `${KEY_PREFIXES.USER_PROFILE}${userId}`;
      
      const pipeline = redis.pipeline();
      
      // Get all tokens for user
      const tokens = await redis.smembers(tokenKey);
      
      // Add all tokens to blacklist
      tokens.forEach(token => {
        const blacklistKey = `${KEY_PREFIXES.BLACKLIST}${token}`;
        pipeline.setex(blacklistKey, TTL.TOKEN_BLACKLIST, '1');
      });
      
      // Remove session, tokens, and profile cache
      pipeline.del(sessionKey, tokenKey, profileKey);
      
      await pipeline.exec();
      
      console.log(`All sessions invalidated for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error invalidating all sessions:', error);
      return false;
    }
  }
  
  /**
   * User Profile Caching Methods
   */
  
  /**
   * Cache user profile data
   * @param {string} userId - User ID
   * @param {Object} profileData - User profile data
   * @returns {Promise<boolean>}
   */
  async cacheUserProfile(userId, profileData) {
    try {
      const profileKey = `${KEY_PREFIXES.USER_PROFILE}${userId}`;
      
      // Remove sensitive data before caching
      const safeProfileData = {
        id: profileData._id || profileData.id,
        name: profileData.name,
        email: profileData.email,
        avatar: profileData.avatar,
        createdAt: profileData.createdAt,
        updatedAt: profileData.updatedAt
      };
      
      await redis.setex(profileKey, TTL.USER_PROFILE, JSON.stringify(safeProfileData));
      
      console.log(`User profile cached for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error caching user profile:', error);
      return false;
    }
  }
  
  /**
   * Get cached user profile
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>}
   */
  async getCachedUserProfile(userId) {
    try {
      const profileKey = `${KEY_PREFIXES.USER_PROFILE}${userId}`;
      const profileData = await redis.get(profileKey);
      
      if (!profileData) {
        return null;
      }
      
      return JSON.parse(profileData);
    } catch (error) {
      console.error('Error getting cached user profile:', error);
      return null;
    }
  }
  
  /**
   * Invalidate user profile cache
   * @param {string} userId - User ID
   * @returns {Promise<boolean>}
   */
  async invalidateUserProfileCache(userId) {
    try {
      const profileKey = `${KEY_PREFIXES.USER_PROFILE}${userId}`;
      await redis.del(profileKey);
      
      console.log(`User profile cache invalidated for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error invalidating user profile cache:', error);
      return false;
    }
  }
  
  /**
   * Utility Methods
   */
  
  /**
   * Get session statistics
   * @returns {Promise<Object>}
   */
  async getSessionStats() {
    try {
      const stats = {
        activeSessions: 0,
        cachedProfiles: 0,
        blacklistedTokens: 0
      };
      
      // Count active sessions
      const sessionKeys = await redis.keys(`${KEY_PREFIXES.SESSION}*`);
      stats.activeSessions = sessionKeys.length;
      
      // Count cached profiles
      const profileKeys = await redis.keys(`${KEY_PREFIXES.USER_PROFILE}*`);
      stats.cachedProfiles = profileKeys.length;
      
      // Count blacklisted tokens
      const blacklistKeys = await redis.keys(`${KEY_PREFIXES.BLACKLIST}*`);
      stats.blacklistedTokens = blacklistKeys.length;
      
      return stats;
    } catch (error) {
      console.error('Error getting session stats:', error);
      return { activeSessions: 0, cachedProfiles: 0, blacklistedTokens: 0 };
    }
  }
  
  /**
   * Clean up expired sessions (can be called periodically)
   * @returns {Promise<number>}
   */
  async cleanupExpiredSessions() {
    try {
      const sessionKeys = await redis.keys(`${KEY_PREFIXES.SESSION}*`);
      let cleanedCount = 0;
      
      for (const key of sessionKeys) {
        const sessionData = await redis.get(key);
        if (sessionData) {
          const session = JSON.parse(sessionData);
          if (session.expiresAt < Date.now()) {
            await redis.del(key);
            cleanedCount++;
          }
        }
      }
      
      console.log(`Cleaned up ${cleanedCount} expired sessions`);
      return cleanedCount;
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
      return 0;
    }
  }
  
  /**
   * Health check for Redis connection
   * @returns {Promise<boolean>}
   */
  async healthCheck() {
    try {
      await redis.ping();
      return true;
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }
}

module.exports = new RedisService(); 
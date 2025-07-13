# Redis Implementation for Session Management and Caching

## Overview

This implementation uses Redis for session management and user profile caching following industry best practices and the DRY principle.

## Architecture

### 1. Redis Service Layer (`src/services/redisService.js`)

**Key Features:**
- **Session Management**: Store user sessions with 24-hour TTL
- **Token Validation**: Validate JWT tokens against Redis
- **Profile Caching**: Cache user profiles for 30 minutes
- **Token Blacklisting**: Blacklist invalidated tokens
- **Atomic Operations**: Use Redis pipelines for consistency

### 2. Key Structure

```
session:{userId}          - Session data with TTL
user:tokens:{userId}      - Set of active tokens for user
user:profile:{userId}     - Cached user profile data
blacklist:{token}         - Blacklisted tokens
```

### 3. TTL Configuration

```javascript
const TTL = {
  SESSION: 24 * 60 * 60,        // 24 hours
  USER_PROFILE: 30 * 60,        // 30 minutes
  TOKEN_BLACKLIST: 24 * 60 * 60 // 24 hours
};
```

## Features Implemented

### ✅ Session Management
- **Store Session**: Store user session with token and user data
- **Validate Token**: Check if token is valid and not blacklisted
- **Invalidate Session**: Logout with token blacklisting
- **Invalidate All Sessions**: Force logout from all devices

### ✅ User Profile Caching
- **Cache Profile**: Store user profile data safely (no sensitive data)
- **Get Cached Profile**: Retrieve profile from cache first
- **Invalidate Cache**: Clear cache on profile updates

### ✅ Security Features
- **Token Blacklisting**: Prevent reuse of logged-out tokens
- **Session Expiry**: Automatic session cleanup
- **Password Change**: Invalidate all sessions on password change

### ✅ Monitoring & Maintenance
- **Health Checks**: Redis connection monitoring
- **Session Statistics**: Active sessions, cached profiles, blacklisted tokens
- **Cleanup Jobs**: Automated cleanup of expired sessions

## API Endpoints

### Authentication
```
POST /api/auth/register    - Register with session storage
POST /api/auth/login       - Login with session storage
POST /api/auth/logout      - Logout (invalidate session)
POST /api/auth/logout-all  - Logout from all devices
```

### Profile Management
```
GET  /api/auth/profile     - Get profile (cached)
PUT  /api/auth/profile     - Update profile (invalidate cache)
POST /api/auth/profile/avatar - Upload avatar (invalidate cache)
PUT  /api/auth/profile/password - Change password (invalidate all sessions)
```

### Monitoring
```
GET /api/auth/health      - Health check with Redis stats
```

## Usage Examples

### 1. Login Flow
```javascript
// User logs in
const token = signToken(user);
await redisService.storeSession(userId, token, userData);
// Session stored with 24-hour TTL
```

### 2. Profile Retrieval
```javascript
// Get profile (cached first, then database)
const cachedProfile = await redisService.getCachedUserProfile(userId);
if (cachedProfile) {
  return cachedProfile; // Fast response
}
// Fallback to database and cache result
```

### 3. Logout Flow
```javascript
// Logout user
await redisService.invalidateSession(userId, token);
// Token blacklisted, session removed, cache cleared
```

## Best Practices Implemented

### ✅ DRY Principle
- **Centralized Redis Service**: Single service for all Redis operations
- **Reusable Methods**: Common patterns for session/profile management
- **Consistent Error Handling**: Standardized error handling across all methods

### ✅ Security Best Practices
- **Token Blacklisting**: Prevent token reuse after logout
- **Session Expiry**: Automatic cleanup of expired sessions
- **Secure Profile Caching**: No sensitive data in cache
- **Password Change Security**: Invalidate all sessions on password change

### ✅ Performance Optimization
- **Redis Pipelines**: Atomic operations for consistency
- **Profile Caching**: Reduce database queries
- **Efficient Key Structure**: Organized key naming
- **TTL Management**: Automatic expiration

### ✅ Monitoring & Maintenance
- **Health Checks**: Regular Redis connection monitoring
- **Session Statistics**: Track active sessions and cache usage
- **Automated Cleanup**: Scheduled cleanup of expired sessions
- **Error Logging**: Comprehensive error logging

### ✅ Scalability
- **Key Prefixes**: Organized key structure for easy management
- **Configurable TTL**: Easy to adjust cache durations
- **Session Tracking**: Track multiple sessions per user
- **Cleanup Jobs**: Prevent memory leaks

## Configuration

### Environment Variables
```env
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
```

### Redis Connection
```javascript
const redis = new Redis(process.env.REDIS_URL);
```

## Monitoring

### Health Check Response
```json
{
  "status": "OK",
  "redis": "connected",
  "sessionStats": {
    "activeSessions": 5,
    "cachedProfiles": 3,
    "blacklistedTokens": 2
  }
}
```

## Scheduled Jobs

### Session Cleanup
- **Frequency**: Every hour
- **Purpose**: Remove expired sessions
- **Logging**: Cleanup statistics

### Health Check
- **Frequency**: Every 5 minutes
- **Purpose**: Monitor Redis connection
- **Alerting**: Log failures

## Error Handling

### Graceful Degradation
- **Redis Unavailable**: Fallback to database
- **Cache Miss**: Fetch from database and cache
- **Token Validation**: Fail secure (deny access)

### Comprehensive Logging
- **Session Operations**: Track all session activities
- **Cache Operations**: Monitor cache hits/misses
- **Error Details**: Detailed error information

## Testing

### Manual Testing
1. **Login**: Verify session storage
2. **Profile Access**: Check cache behavior
3. **Logout**: Verify token blacklisting
4. **Password Change**: Confirm session invalidation

### Health Monitoring
1. **Health Endpoint**: Check Redis connection
2. **Session Stats**: Monitor active sessions
3. **Cleanup Jobs**: Verify automatic cleanup

## Benefits

### Performance
- **Fast Profile Access**: Cached user profiles
- **Reduced Database Load**: Fewer database queries
- **Quick Token Validation**: Redis-based validation

### Security
- **Token Blacklisting**: Prevent unauthorized access
- **Session Management**: Proper session lifecycle
- **Secure Logout**: Complete session cleanup

### Scalability
- **Multiple Sessions**: Support multiple devices
- **Efficient Storage**: Optimized key structure
- **Automatic Cleanup**: Prevent memory leaks

### Maintainability
- **Centralized Service**: Easy to modify and extend
- **Comprehensive Logging**: Easy debugging
- **Health Monitoring**: Proactive issue detection 
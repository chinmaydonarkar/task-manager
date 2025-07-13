# 🧪 Redis Caching Testing Guide

## **Quick Test Methods**

### **Method 1: Manual API Testing**

#### **Step 1: Login and Get Token**
```bash
curl -X POST http://localhost:5050/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

#### **Step 2: Get Profile (First Request - Should Cache)**
```bash
curl -X GET http://localhost:5050/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### **Step 3: Get Profile Again (Should Be From Cache)**
```bash
curl -X GET http://localhost:5050/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Result**: Second request should be faster than the first.

### **Method 2: Using the Test Script**

```bash
# Run the automated test script
node test-caching.js
```

### **Method 3: Browser Developer Tools**

1. **Open Browser DevTools** (F12)
2. **Go to Network Tab**
3. **Login to the application**
4. **Navigate to profile page**
5. **Refresh the page**
6. **Compare response times**

## **🔍 Detailed Testing Steps**

### **1. Session Storage Testing**

#### **Test Login Session Storage**
```bash
# Login
curl -X POST http://localhost:5050/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Check Redis directly (if you have redis-cli)
redis-cli
> KEYS session:*
> GET session:USER_ID_HERE
```

#### **Expected Results:**
- ✅ Session stored in Redis
- ✅ Token associated with user
- ✅ Profile cached automatically

### **2. Profile Caching Testing**

#### **Test Cache Hit/Miss**
```bash
# First request (cache miss - slower)
time curl -X GET http://localhost:5050/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# Second request (cache hit - faster)
time curl -X GET http://localhost:5050/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### **Expected Results:**
- ✅ First request: ~50-100ms (database query)
- ✅ Second request: ~5-20ms (cache hit)
- ✅ Same data returned

### **3. Cache Invalidation Testing**

#### **Test Profile Update Cache Invalidation**
```bash
# Update profile
curl -X PUT http://localhost:5050/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'

# Get profile again (should be fresh from database)
curl -X GET http://localhost:5050/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### **Expected Results:**
- ✅ Cache cleared after update
- ✅ Fresh data from database
- ✅ Updated name reflected

### **4. Session Invalidation Testing**

#### **Test Logout Session Invalidation**
```bash
# Logout
curl -X POST http://localhost:5050/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN"

# Try to access profile with invalidated token
curl -X GET http://localhost:5050/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### **Expected Results:**
- ✅ 401 Unauthorized response
- ✅ Token blacklisted in Redis
- ✅ Session removed from Redis

### **5. Health Check Testing**

#### **Test Redis Health and Statistics**
```bash
curl -X GET http://localhost:5050/api/auth/health
```

#### **Expected Response:**
```json
{
  "status": "OK",
  "redis": "connected",
  "sessionStats": {
    "activeSessions": 1,
    "cachedProfiles": 1,
    "blacklistedTokens": 0
  }
}
```

## **🔧 Redis CLI Testing**

### **Direct Redis Commands**

```bash
# Connect to Redis
redis-cli

# Check all keys
KEYS *

# Check session keys
KEYS session:*

# Check profile cache keys
KEYS user:profile:*

# Check token sets
KEYS user:tokens:*

# Check blacklisted tokens
KEYS blacklist:*

# Get specific session data
GET session:USER_ID_HERE

# Get cached profile
GET user:profile:USER_ID_HERE

# Check if token is in user's active tokens
SISMEMBER user:tokens:USER_ID_HERE TOKEN_HERE

# Check if token is blacklisted
EXISTS blacklist:TOKEN_HERE
```

## **📊 Performance Testing**

### **Response Time Comparison**

#### **Without Cache (Database Only)**
```bash
# Simulate no cache by clearing Redis
redis-cli FLUSHALL

# Test response time
time curl -X GET http://localhost:5050/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### **With Cache**
```bash
# First request (cache miss)
time curl -X GET http://localhost:5050/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# Second request (cache hit)
time curl -X GET http://localhost:5050/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Performance Improvement:**
- Database query: ~50-100ms
- Cache hit: ~5-20ms
- **Improvement: 70-80% faster**

## **🐛 Debugging Cache Issues**

### **Common Issues and Solutions**

#### **Issue 1: Cache Not Working**
```bash
# Check if Redis is running
redis-cli ping

# Check Redis connection in app
curl -X GET http://localhost:5050/api/auth/health
```

#### **Issue 2: Cache Not Invalidating**
```bash
# Check if profile update is working
curl -X PUT http://localhost:5050/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name": "Test"}'

# Check if cache was cleared
redis-cli GET user:profile:USER_ID_HERE
```

#### **Issue 3: Session Not Invalidating**
```bash
# Check if logout is working
curl -X POST http://localhost:5050/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check if token is blacklisted
redis-cli EXISTS blacklist:TOKEN_HERE
```

## **📈 Monitoring Cache Performance**

### **Cache Hit Rate Monitoring**

```bash
# Check cache statistics
curl -X GET http://localhost:5050/api/auth/health

# Monitor Redis memory usage
redis-cli INFO memory

# Monitor Redis keys
redis-cli INFO keyspace
```

### **Expected Metrics:**
- **Cache Hit Rate**: >80% for frequently accessed profiles
- **Memory Usage**: Reasonable for your user base
- **Active Sessions**: Matches logged-in users
- **Cached Profiles**: Matches active users

## **🎯 Success Criteria**

### **✅ Cache is Working If:**
1. **Second profile request is faster** than first
2. **Health endpoint shows cached profiles** > 0
3. **Redis contains user profile keys**
4. **Cache invalidates** after profile updates
5. **Sessions invalidate** after logout

### **❌ Cache is NOT Working If:**
1. **Response times are similar** for repeated requests
2. **Health endpoint shows 0 cached profiles**
3. **Redis is empty** or not connected
4. **Cache doesn't invalidate** after updates
5. **Sessions remain active** after logout

## **🚀 Quick Test Checklist**

- [ ] **Login** - Session stored in Redis
- [ ] **Get Profile** - First request caches data
- [ ] **Get Profile Again** - Second request is faster
- [ ] **Update Profile** - Cache invalidates
- [ ] **Logout** - Session invalidates
- [ ] **Health Check** - Shows Redis stats
- [ ] **Performance** - 70-80% improvement with cache

## **🔍 Advanced Testing**

### **Load Testing with Multiple Users**

```bash
# Simulate multiple users
for i in {1..5}; do
  curl -X GET http://localhost:5050/api/auth/profile \
    -H "Authorization: Bearer TOKEN_$i" &
done
wait
```

### **Stress Testing Cache**

```bash
# Rapid profile requests
for i in {1..100}; do
  curl -X GET http://localhost:5050/api/auth/profile \
    -H "Authorization: Bearer YOUR_TOKEN" &
done
wait
```

This comprehensive testing approach will help you verify that Redis caching is working correctly in your project! 🎉 